import "server-only";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { todayInTimeZone } from "@/lib/dates";
import { getSiteUrl } from "@/lib/env";
import { getPushConfig, sendPushToUser } from "@/lib/push/send";
import { monthStart } from "@/lib/savings/usage";
import { formatPLN } from "@/lib/money";
import { subscriptionFromRow, SUBSCRIPTION_COLUMNS } from "@/lib/subscriptions/mapping";
import type { Subscription } from "@/lib/subscriptions/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildMonthlySummary, buildMonthlySummaryEmail } from "./monthly";

const PAGE_SIZE = 1000;
const ID_CHUNK = 200;
const MAX_SENDS_PER_RUN = 300;
/** Sent on the first days of the month only, so an account made mid-month waits for the next one. */
const LAST_DAY_TO_SEND = 3;

export type SummaryResult =
  | { status: "not_configured" }
  | { status: "ok"; due: number; sent: number; failed: number; skipped: number };

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

interface DueProfile {
  id: string;
  email: string;
  today: string;
  month: string;
  previous: string | null;
}

async function loadDue(admin: AdminClient, now: Date): Promise<DueProfile[]> {
  const due: DueProfile[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, email, time_zone, monthly_summary_sent_on")
      .eq("monthly_summary_enabled", true)
      .not("email", "is", null)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`profiles: ${error.message}`);
    for (const row of data) {
      const today = todayInTimeZone(row.time_zone, now);
      const month = monthStart(today);
      if (Number(today.slice(8, 10)) > LAST_DAY_TO_SEND) continue;
      if (row.monthly_summary_sent_on && row.monthly_summary_sent_on >= month) continue;
      due.push({ id: row.id, email: row.email as string, today, month, previous: row.monthly_summary_sent_on });
    }
    if (data.length < PAGE_SIZE) return due;
  }
}

/** Once a month: what the month will cost, rare renewals, ending trials and the "did you use it?" check. */
export async function dispatchMonthlySummaries(now: Date = new Date()): Promise<SummaryResult> {
  const admin = createSupabaseAdminClient();
  const emailConfig = getEmailConfig();
  if (!admin || !emailConfig) return { status: "not_configured" };

  const due = await loadDue(admin, now);
  const result = { status: "ok" as const, due: due.length, sent: 0, failed: 0, skipped: 0 };
  const appUrl = getSiteUrl();
  const pushConfig = getPushConfig();

  for (let i = 0; i < due.length && result.sent + result.failed < MAX_SENDS_PER_RUN; i += ID_CHUNK) {
    const batch = due.slice(i, i + ID_CHUNK);
    const ids = batch.map((p) => p.id);
    const { data: rows, error } = await admin.from("subscriptions").select(`user_id, ${SUBSCRIPTION_COLUMNS}`).in("user_id", ids);
    if (error) throw new Error(`subscriptions: ${error.message}`);
    const { data: answerRows } = await admin.from("usage_checks").select("user_id, subscription_id, month, used").in("user_id", ids);

    const byUser = new Map<string, Subscription[]>();
    for (const row of rows) {
      const subscription = subscriptionFromRow(row);
      if (subscription) byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), subscription]);
    }

    for (const profile of batch) {
      if (result.sent + result.failed >= MAX_SENDS_PER_RUN) break;
      const subscriptions = byUser.get(profile.id) ?? [];
      if (!subscriptions.some((s) => s.status === "active")) {
        result.skipped += 1;
        continue;
      }
      // Claim the month first, so parallel runs never send twice.
      // Compare-and-set on the value read above: only one run can move it to this month.
      const claim = admin.from("profiles").update({ monthly_summary_sent_on: profile.month }).eq("id", profile.id);
      const { data: claimed } = await (profile.previous === null
        ? claim.is("monthly_summary_sent_on", null)
        : claim.eq("monthly_summary_sent_on", profile.previous)
      ).select("id");
      if (!claimed?.length) {
        result.skipped += 1;
        continue;
      }

      const answers = (answerRows ?? [])
        .filter((a) => a.user_id === profile.id)
        .map((a) => ({ subscriptionId: a.subscription_id, month: a.month, used: a.used }));
      const summary = buildMonthlySummary(subscriptions, answers, profile.today, now);
      const email = buildMonthlySummaryEmail(summary, appUrl);
      const sent = await sendEmail(emailConfig, { to: profile.email, ...email, idempotencyKey: `monthly-${profile.id}-${profile.month}` });
      if (sent.ok) {
        result.sent += 1;
        if (pushConfig && summary.paymentCount > 0) {
          await sendPushToUser(admin, pushConfig, profile.id, {
            title: `W ${summary.monthName}: ${summary.estimate ? "ok. " : ""}${formatPLN(summary.totalCents)} stałych opłat`,
            body: summary.usageQuestionCount > 0 ? "Sprawdź, z czego korzystasz — 30 sekund." : `Płatności: ${summary.paymentCount}.`,
            url: summary.usageQuestionCount > 0 ? "/panel/oszczedzaj#uzywanie" : "/panel",
            tag: `monthly-${profile.month}`,
          }).catch(() => 0);
        }
      } else {
        result.failed += 1;
        // Give the month back so the next run tries again.
        await admin.from("profiles").update({ monthly_summary_sent_on: profile.previous }).eq("id", profile.id);
      }
    }
  }
  return result;
}
