import "server-only";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { getLegalInfo } from "@/lib/legal";
import { PREMIUM_PLANS } from "@/lib/premium/plan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type WaitlistResult = "added" | "exists" | "unavailable";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(title: string, paragraphs: string[], action: { label: string; url: string } | null, unsubscribeUrl: string) {
  const html = `<!doctype html><html lang="pl"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:18px">Opłacik</p>
<h1 style="margin:0 0 12px;font-size:20px">${escapeHtml(title)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 12px;line-height:1.5">${escapeHtml(p)}</p>`).join("\n")}
${action ? `<p style="margin:20px 0 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#c4f542;color:#0c1002;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">${escapeHtml(action.label)}</a></p>` : ""}
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#71717a">Dostajesz tę wiadomość, bo zapisałeś się na listę chętnych na Opłacik Premium. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a">Wypisz mnie</a></p>
</body></html>`;
  const text = [title, "", ...paragraphs, ...(action ? ["", `${action.label}: ${action.url}`] : []), "", `Wypisz mnie: ${unsubscribeUrl}`].join("\n");
  return { html, text };
}

const unsubscribeUrl = (token: string) => `${getSiteUrl()}/premium/wypisz?t=${token}`;

/** Adds an address to the Premium waitlist; sends a confirmation to it and a heads-up to the operator. */
export async function addToWaitlist(input: { email: string; userId?: string | null; source: "landing" | "app" }): Promise<WaitlistResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return "unavailable";
  const email = input.email.trim().toLowerCase();

  const { data, error } = await admin
    .from("premium_waitlist")
    .insert({ email, user_id: input.userId ?? null, source: input.source })
    .select("unsubscribe_token")
    .single();
  if (error) {
    if (error.code === "23505") {
      // Someone who unsubscribed and signs up again is back on the list.
      await admin.from("premium_waitlist").update({ unsubscribed_at: null }).eq("email", email).not("unsubscribed_at", "is", null);
      return "exists";
    }
    console.error("Waitlist insert failed", error.message);
    return "unavailable";
  }

  const emailConfig = getEmailConfig();
  if (emailConfig) {
    const monthly = PREMIUM_PLANS.monthly.label;
    const yearly = PREMIUM_PLANS.yearly.label;
    const confirmation = layout(
      "Jesteś na liście chętnych na Premium",
      [
        "Dzięki! Gdy Opłacik Premium wystartuje, dostaniesz od nas jedną wiadomość — jako jeden z pierwszych.",
        `Premium da Ci brak limitu subskrypcji i rachunków oraz automatyczne dodawanie i aktualizowanie ich z przekazanych e-maili. Planowana cena: ${monthly} albo ${yearly}.`,
        "Do tego czasu wszystkie podstawowe funkcje są za darmo.",
      ],
      { label: "Otwórz Opłacik", url: `${getSiteUrl()}/` },
      unsubscribeUrl(data.unsubscribe_token),
    );
    await sendEmail(emailConfig, {
      to: email,
      subject: "Jesteś na liście chętnych na Opłacik Premium",
      ...confirmation,
      idempotencyKey: `waitlist-confirm-${data.unsubscribe_token}`,
    });

    const operator = getLegalInfo().contactEmail;
    if (operator) {
      await sendEmail(emailConfig, {
        to: operator,
        subject: `Nowa osoba na liście Premium: ${email}`,
        text: `${email} zapisał(a) się na listę chętnych na Premium (${input.source === "app" ? "z aplikacji" : "ze strony głównej"}).\n\nCała lista: ${getSiteUrl()}/panel/admin`,
        html: `<p><strong>${escapeHtml(email)}</strong> zapisał(a) się na listę chętnych na Premium (${input.source === "app" ? "z aplikacji" : "ze strony głównej"}).</p><p><a href="${getSiteUrl()}/panel/admin">Cała lista</a></p>`,
        idempotencyKey: `waitlist-operator-${data.unsubscribe_token}`,
      });
    }
  }
  return "added";
}

export interface WaitlistEntry {
  email: string;
  source: "landing" | "app";
  createdAt: string;
  notifiedAt: string | null;
  unsubscribedAt: string | null;
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("premium_waitlist")
    .select("email, source, created_at, notified_at, unsubscribed_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  return (data ?? []).map((row) => ({
    email: row.email,
    source: row.source,
    createdAt: row.created_at,
    notifiedAt: row.notified_at,
    unsubscribedAt: row.unsubscribed_at,
  }));
}

/** Most launch e-mails sent per click, so one request stays within the function time limit. */
export const LAUNCH_BATCH = 100;

/** E-mails everyone still waiting that Premium is available. Returns how many were sent and how many remain. */
export async function sendLaunchNotifications(): Promise<{ sent: number; failed: number; remaining: number } | null> {
  const admin = createSupabaseAdminClient();
  const emailConfig = getEmailConfig();
  if (!admin || !emailConfig) return null;

  const { data: pending } = await admin
    .from("premium_waitlist")
    .select("id, email, unsubscribe_token")
    .is("notified_at", null)
    .is("unsubscribed_at", null)
    .order("created_at")
    .limit(LAUNCH_BATCH);

  let sent = 0;
  let failed = 0;
  for (const entry of pending ?? []) {
    const message = layout(
      "Opłacik Premium już działa 🎉",
      [
        "Zapisałeś się na listę chętnych — dajemy znać jako pierwszym: Premium jest już dostępne.",
        "Bez limitu subskrypcji i rachunków, automatyczne dodawanie i aktualizacja z e-maili (podwyżki, okresy próbne, anulowania).",
        `Cena: ${PREMIUM_PLANS.monthly.label} albo ${PREMIUM_PLANS.yearly.label}.`,
      ],
      { label: "Przejdź na Premium", url: `${getSiteUrl()}/panel/premium` },
      unsubscribeUrl(entry.unsubscribe_token),
    );
    const result = await sendEmail(emailConfig, {
      to: entry.email,
      subject: "Opłacik Premium już działa",
      ...message,
      idempotencyKey: `waitlist-launch-${entry.id}`,
    });
    if (result.ok) {
      sent += 1;
      await admin.from("premium_waitlist").update({ notified_at: new Date().toISOString() }).eq("id", entry.id);
    } else {
      failed += 1;
    }
  }

  const { count } = await admin
    .from("premium_waitlist")
    .select("id", { count: "exact", head: true })
    .is("notified_at", null)
    .is("unsubscribed_at", null);
  return { sent, failed, remaining: count ?? 0 };
}

/** Unsubscribes the holder of the link; returns false for unknown tokens. */
export async function unsubscribeFromWaitlist(token: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin || !/^[0-9a-f]{32}$/.test(token)) return false;
  const { data } = await admin
    .from("premium_waitlist")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("id");
  return Boolean(data?.length);
}

/** Admins are the e-mail addresses listed in ADMIN_EMAILS (comma-separated). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
