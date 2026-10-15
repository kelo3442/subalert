import "server-only";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { getLegalInfo } from "@/lib/legal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWelcomeEmail } from "./email";

/**
 * Sends the welcome e-mail once per account. The row is claimed first, so two
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

  const result = await sendEmail(config, {
    to: user.email,
    ...buildWelcomeEmail(getSiteUrl()),
    idempotencyKey: `welcome-${user.id}`,
    replyTo: getLegalInfo().contactEmail ?? undefined,
  });
  if (!result.ok) {
    console.error("Welcome e-mail failed", result.error);
    await admin.from("profiles").update({ welcome_email_sent_at: null }).eq("id", user.id);
  }
}
