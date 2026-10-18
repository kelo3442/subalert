import "server-only";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { formatDateLong } from "@/lib/dates";
import { getLegalInfo } from "@/lib/legal";
import { createEarlyAccessLink } from "@/lib/premium/early-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWelcomeEmail } from "./email";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Tells the operator (contact address) that someone created an account. */
async function notifyOperatorOfSignup(
  config: NonNullable<ReturnType<typeof getEmailConfig>>,
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  user: { id: string; email: string },
  earlyAccess: "granted" | "pending" | "none",
): Promise<void> {
  const operator = getLegalInfo().contactEmail;
  if (!operator) return;
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true });
  const note = {
    granted: " Dostało darmowe Premium (pierwsza setka).",
    pending: " Dostanie darmowe Premium po kliknięciu linku w mailu.",
    none: "",
  }[earlyAccess];
  const total = (count ? ` To konto nr ${count}.` : "") + note;
  const result = await sendEmail(config, {
    to: operator,
    subject: `Nowe konto w Opłaciku: ${user.email}`,
    text: `${user.email} założył(a) konto w Opłaciku.${total}\n\nPanel administracyjny: ${getSiteUrl()}/panel/admin`,
    html: `<p><strong>${escapeHtml(user.email)}</strong> założył(a) konto w Opłaciku.${total}</p><p><a href="${getSiteUrl()}/panel/admin">Panel administracyjny</a></p>`,
    idempotencyKey: `signup-notice-${user.id}`,
  });
  if (!result.ok) console.error("Signup notice failed", result.error);
}

/**
 * Sends the welcome e-mail once per account (and a heads-up to the operator). The row is claimed first, so two
 * requests racing on the first visit send a single message; a failed send is
 * released and retried on the next visit.
 */
export async function sendWelcomeEmailOnce(user: { id: string; email: string }): Promise<void> {
  const config = getEmailConfig();
  const admin = createSupabaseAdminClient();
  if (!config || !admin || !user.email) return;

  const { data: claimed, error } = await admin
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("welcome_email_sent_at", null)
    .select("id");
  if (error || !claimed?.length) return;

  const { data: profile } = await admin.from("profiles").select("early_access_at, premium_until").eq("id", user.id).maybeSingle();
  const earlyAccessUntil = profile?.early_access_at && profile.premium_until ? formatDateLong(profile.premium_until.slice(0, 10)) : undefined;

  const earlyAccessClaimUrl = earlyAccessUntil ? undefined : ((await createEarlyAccessLink(user)) ?? undefined);

  await notifyOperatorOfSignup(config, admin, user, earlyAccessUntil ? "granted" : earlyAccessClaimUrl ? "pending" : "none");

  const result = await sendEmail(config, {
    to: user.email,
    ...buildWelcomeEmail(getSiteUrl(), { earlyAccessUntil, earlyAccessClaimUrl }),
    idempotencyKey: `welcome-${user.id}`,
    replyTo: getLegalInfo().contactEmail ?? undefined,
  });
  if (!result.ok) {
    console.error("Welcome e-mail failed", result.error);
    await admin.from("profiles").update({ welcome_email_sent_at: null }).eq("id", user.id);
  }
}
