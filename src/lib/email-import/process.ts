import "server-only";
import { createHash } from "node:crypto";
import { DEFAULT_TIME_ZONE } from "@/lib/dates";
import { isPremiumActive } from "@/lib/premium/plan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decideAction, extractInboundToken, parseReceiptEmail, type InboundEmail } from "./parse";

/** Subset of the Postmark inbound webhook payload (https://postmarkapp.com/developer/webhooks/inbound-webhook). */
export interface InboundPayload {
  From?: string;
  To?: string;
  OriginalRecipient?: string;
  MailboxHash?: string;
  ToFull?: { Email?: string }[];
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
  Date?: string;
  MessageID?: string;
}

export type ProcessResult =
  | "not_configured"
  | "not_premium"
  | "unknown_recipient"
  | "rate_limited"
  | "duplicate_message"
  | "gmail_verification"
  | "ignored"
  | "already_tracked"
  | "suggested"
  | "auto_added";

const DAILY_LIMIT = 100;
const clip = (value: string, max: number) => value.slice(0, max);

/**
 * Turns a forwarded e-mail into a detected subscription. Only extracted fields
 * are stored; the message body is discarded after parsing.
 */
export async function processInboundEmail(payload: InboundPayload): Promise<ProcessResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return "not_configured";

  const recipients = [payload.MailboxHash, payload.OriginalRecipient, ...(payload.ToFull ?? []).map((t) => t.Email), payload.To];
  const token = extractInboundToken(recipients.filter((value): value is string => Boolean(value)));
  if (!token) return "unknown_recipient";

  const { data: profile } = await admin
    .from("profiles")
    .select("id, time_zone, auto_add_detected, premium_until")
    .eq("inbound_token", token)
    .maybeSingle();
  if (!profile) return "unknown_recipient";
  // Automatic adding from e-mails is a Premium feature.
  if (!isPremiumActive(profile.premium_until)) return "not_premium";

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin
    .from("detected_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) return "rate_limited";

  const receivedAt = payload.Date && !Number.isNaN(Date.parse(payload.Date)) ? new Date(payload.Date) : new Date();
  const email: InboundEmail = {
    from: payload.From ?? "",
    subject: payload.Subject ?? "",
    text: payload.TextBody ?? "",
    html: payload.HtmlBody ?? "",
    receivedAt,
  };
  const parsed = parseReceiptEmail(email, profile.time_zone || DEFAULT_TIME_ZONE);

  if (parsed.kind === "gmail_verification") {
    await admin
      .from("profiles")
      .update({
        gmail_forwarding_code: parsed.code,
        gmail_forwarding_link: parsed.link,
        gmail_forwarding_received_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    return "gmail_verification";
  }
  if (parsed.kind === "ignored") return "ignored";

  const { data: existing } = await admin
    .from("subscriptions")
    .select("name")
    .eq("user_id", profile.id)
    .eq("status", "active");
  const action = decideAction(parsed, {
    autoAdd: profile.auto_add_detected,
    existingNames: (existing ?? []).map((row) => row.name),
  });
  if (action === "duplicate") return "already_tracked";

  const messageId = clip(
    payload.MessageID || createHash("sha256").update(`${email.from}|${email.subject}|${payload.Date ?? ""}`).digest("hex"),
    300,
  );

  // Inserting first makes a redelivered message a no-op (unique user_id + message_id).
  const { data: detected, error } = await admin
    .from("detected_subscriptions")
    .insert({
      user_id: profile.id,
      message_id: messageId,
      name: clip(parsed.name, 80),
      amount_cents: parsed.amountCents,
      billing_cycle: parsed.cycle,
      next_payment_date: parsed.nextPaymentDate,
      trial_ends_at: parsed.trialEndsAt,
      category: parsed.category,
      manage_url: parsed.manageUrl,
      email_from: clip(email.from, 200),
      email_subject: clip(email.subject, 200),
      received_at: receivedAt.toISOString(),
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return "duplicate_message";
    throw new Error(`detected insert: ${error.message}`);
  }

  if (action === "suggest" || !parsed.amountCents || !parsed.nextPaymentDate) return "suggested";

  const { data: subscription, error: insertError } = await admin
    .from("subscriptions")
    .insert({
      user_id: profile.id,
      name: clip(parsed.name, 80),
      amount_cents: parsed.amountCents,
      billing_cycle: parsed.cycle,
      next_payment_date: parsed.nextPaymentDate,
      trial_ends_at: parsed.trialEndsAt,
      category: parsed.category,
      manage_url: parsed.manageUrl,
      notes: "Dodano automatycznie z przekazanego e-maila.",
    })
    .select("id")
    .single();
  if (insertError) return "suggested";

  await admin
    .from("detected_subscriptions")
    .update({ status: "added", auto_added: true, subscription_id: subscription.id })
    .eq("id", detected.id);
  return "auto_added";
}
