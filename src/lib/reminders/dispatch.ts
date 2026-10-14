import "server-only";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { getPushConfig, sendPushToUser } from "@/lib/push/send";
import { subscriptionFromRow, SUBSCRIPTION_COLUMNS } from "@/lib/subscriptions/mapping";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildReminderEmail, buildReminderPush } from "./email-template";
import { planReminders, reminderKey, type PlanProfile, type PlanSubscription } from "./plan";

const PAGE_SIZE = 1000;
const ID_CHUNK = 200;
const MAX_SENDS_PER_RUN = 300;

export type DispatchResult =
  | { status: "not_configured"; missing: string[] }
  | { status: "ok"; due: number; sent: number; failed: number; skipped: number; pushed: number };

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

async function loadProfiles(admin: AdminClient): Promise<PlanProfile[]> {
  const profiles: PlanProfile[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("profiles")
      .select("id, email, time_zone, reminders_enabled, reminder_days_before")
      .eq("reminders_enabled", true)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`profiles: ${error.message}`);
    for (const row of data) {
      profiles.push({
        id: row.id,
        email: row.email,
        timeZone: row.time_zone,
        remindersEnabled: row.reminders_enabled,
        daysBefore: row.reminder_days_before,
      });
    }
    if (data.length < PAGE_SIZE) return profiles;
  }
}

async function loadSubscriptions(admin: AdminClient, userIds: string[]): Promise<PlanSubscription[]> {
  const subscriptions: PlanSubscription[] = [];
  for (const ids of chunk(userIds, ID_CHUNK)) {
    const { data, error } = await admin
      .from("subscriptions")
      .select(`user_id, ${SUBSCRIPTION_COLUMNS}`)
      .in("user_id", ids)
      .eq("status", "active");
    if (error) throw new Error(`subscriptions: ${error.message}`);
    for (const row of data) {
      const subscription = subscriptionFromRow(row);
      if (subscription) subscriptions.push({ ...subscription, userId: row.user_id });
    }
  }
  return subscriptions;
}

/**
 * Sends due payment and trial reminders. Safe to run repeatedly or
 * concurrently: rows are unique per (subscription, kind, event date) and each
 * row is claimed atomically before sending.
 */
export async function dispatchReminders(now: Date = new Date()): Promise<DispatchResult> {
  const admin = createSupabaseAdminClient();
  const emailConfig = getEmailConfig();
  const missing = [
    ...(admin ? [] : ["NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY"]),
    ...(emailConfig ? [] : ["RESEND_API_KEY / REMINDER_FROM_EMAIL"]),
  ];
  if (!admin || !emailConfig) return { status: "not_configured", missing };

  const profiles = await loadProfiles(admin);
  const subscriptions = await loadSubscriptions(admin, profiles.map((p) => p.id));
  const planned = planReminders(profiles, subscriptions, now);
  const result = { status: "ok" as const, due: planned.length, sent: 0, failed: 0, skipped: 0, pushed: 0 };
  if (planned.length === 0) return result;

  for (const batch of chunk(planned, ID_CHUNK)) {
    const { error } = await admin.from("reminders").upsert(
      batch.map((r) => ({
        user_id: r.userId,
        subscription_id: r.subscriptionId,
        kind: r.kind,
        event_date: r.eventDate,
        send_on: r.sendOn,
      })),
      { onConflict: "subscription_id,kind,event_date", ignoreDuplicates: true },
    );
    if (error) throw new Error(`reminders upsert: ${error.message}`);
  }

  const plannedByKey = new Map(planned.map((r) => [reminderKey(r), r]));
  const subscriptionIds = [...new Set(planned.map((r) => r.subscriptionId))];
  const openRows: { id: string; key: string }[] = [];
  for (const ids of chunk(subscriptionIds, ID_CHUNK)) {
    const { data, error } = await admin
      .from("reminders")
      .select("id, subscription_id, kind, event_date, status")
      .in("subscription_id", ids)
      .in("status", ["pending", "failed", "sending"]);
    if (error) throw new Error(`reminders select: ${error.message}`);
    for (const row of data) {
      const key = reminderKey({ subscriptionId: row.subscription_id, kind: row.kind, eventDate: row.event_date });
      // Only rows matching a reminder that is due right now; stale rows (e.g.
      // after the user changed the payment date) are left untouched.
      if (plannedByKey.has(key)) openRows.push({ id: row.id, key });
    }
  }

  const appUrl = getSiteUrl();
  const pushConfig = getPushConfig();
  for (const row of openRows.slice(0, MAX_SENDS_PER_RUN)) {
    const { data: claimed, error: claimError } = await admin.rpc("claim_reminder", { p_reminder_id: row.id });
    if (claimError || !claimed || claimed.length === 0) {
      result.skipped += 1;
      continue;
    }

    const reminder = plannedByKey.get(row.key)!;
    const email = buildReminderEmail({
      kind: reminder.kind,
      subscriptionName: reminder.subscription.name,
      amountCents: reminder.subscription.amountCents,
      eventDate: reminder.eventDate,
      today: reminder.today,
      manageUrl: reminder.subscription.manageUrl,
      appUrl,
      subscriptionId: reminder.subscriptionId,
    });
    const sendResult = await sendEmail(emailConfig, {
      to: reminder.email,
      ...email,
      idempotencyKey: `reminder-${row.id}`,
    });

    // Push is best effort and goes to the user's devices alongside the e-mail.
    if (pushConfig) {
      const push = buildReminderPush({
        kind: reminder.kind,
        subscriptionName: reminder.subscription.name,
        amountCents: reminder.subscription.amountCents,
        eventDate: reminder.eventDate,
        today: reminder.today,
        subscriptionId: reminder.subscriptionId,
      });
      result.pushed += await sendPushToUser(admin, pushConfig, reminder.userId, push).catch(() => 0);
    }

    if (sendResult.ok) {
      result.sent += 1;
      await admin
        .from("reminders")
        .update({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: sendResult.id, last_error: null })
        .eq("id", row.id);
    } else {
      result.failed += 1;
      await admin
        .from("reminders")
        .update({ status: "failed", last_error: sendResult.error.slice(0, 500) })
        .eq("id", row.id);
    }
  }
  result.skipped += Math.max(0, openRows.length - MAX_SENDS_PER_RUN);

  return result;
}
