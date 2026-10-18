import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/env";
import { getLegalInfo } from "@/lib/legal";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDisposableEmail } from "./disposable-email";
import { buildEarlyAccessEmail } from "./early-access-email";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS } from "./plan";

/** Minimum time between two "send me the link again" e-mails. */
export const EARLY_ACCESS_RESEND_SECONDS = 60;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Gives the account free launch Premium if places are left. Safe to call more than once. */
export async function claimEarlyAccess(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const { data, error } = await admin.rpc("claim_early_access", { p_user: userId, p_limit: EARLY_ACCESS_LIMIT, p_months: EARLY_ACCESS_MONTHS });
  if (error) {
    console.error("Early access claim failed", error.message);
    return false;
  }
  return data === true;
}

/** How many accounts have claimed launch Premium, or null when it cannot be checked. */
export async function countEarlyAccessClaims(): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { count, error } = await admin.from("profiles").select("id", { count: "exact", head: true }).not("early_access_at", "is", null);
  return error ? null : count;
}

/**
 * Places left in the launch promotion. 0 (banner hidden) whenever it cannot be
 * checked, e.g. before the database migration has run, so the site never
 * promises Premium it cannot grant.
 */
export async function earlyAccessPlacesLeft(): Promise<number> {
  const count = await countEarlyAccessClaims();
  return count === null ? 0 : Math.max(0, EARLY_ACCESS_LIMIT - count);
}

/**
 * Called on the first visit of a new account. Addresses already confirmed by
 * Google get launch Premium straight away; without e-mail sending (local
 * setups) there is no way to confirm, so the account gets it directly too.
 * Everyone else confirms with the link from the welcome e-mail.
 */
export async function claimEarlyAccessOnSignup(user: { id: string; email: string; emailVerifiedByGoogle: boolean }): Promise<void> {
  if (isDisposableEmail(user.email)) return;
  if (user.emailVerifiedByGoogle || !getEmailConfig()) await claimEarlyAccess(user.id);
}

/**
 * Creates a fresh one-time link that grants launch Premium to whoever opens it.
 * Returns null when the account cannot get it (already has it, throwaway
 * address, no places left). Any earlier link stops working.
 */
export async function createEarlyAccessLink(user: { id: string; email: string }): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  if (!admin || !user.email || isDisposableEmail(user.email)) return null;
  const { data: profile } = await admin.from("profiles").select("early_access_at").eq("id", user.id).maybeSingle();
  if (!profile || profile.early_access_at) return null;
  if ((await earlyAccessPlacesLeft()) === 0) return null;

  const token = randomBytes(32).toString("base64url");
  const { error } = await admin
    .from("profiles")
    .update({ early_access_token_hash: hashToken(token), early_access_token_sent_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) {
    console.error("Early access link failed", error.message);
    return null;
  }
  return `${getSiteUrl()}/premium/odbierz?t=${token}`;
}

export type RedeemResult =
  | { status: "claimed"; premiumUntil: string | null }
  | { status: "already"; premiumUntil: string | null }
  | { status: "full" }
  | { status: "invalid" };

/** Grants launch Premium to the account the link was sent to. */
export async function redeemEarlyAccessToken(token: string): Promise<RedeemResult> {
  const admin = createSupabaseAdminClient();
  if (!admin || !/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: "invalid" };
  const find = () =>
    admin.from("profiles").select("id, early_access_at, premium_until").eq("early_access_token_hash", hashToken(token)).maybeSingle();

  const { data: profile } = await find();
  if (!profile) return { status: "invalid" };
  if (profile.early_access_at) return { status: "already", premiumUntil: profile.premium_until };
  if (!(await claimEarlyAccess(profile.id))) {
    // Another tab may have claimed it a moment ago.
    const { data: again } = await find();
    return again?.early_access_at ? { status: "already", premiumUntil: again.premium_until } : { status: "full" };
  }
  const { data: claimed } = await find();
  return { status: "claimed", premiumUntil: claimed?.premium_until ?? null };
}

export interface EarlyAccessOffer {
  /** The account can still get launch Premium by confirming its address. */
  pending: boolean;
  placesLeft: number;
  /** When the last link was sent, if any. */
  linkSentAt: string | null;
}

/** Whether to show "confirm your e-mail to get free Premium" for this account. */
export async function getEarlyAccessOffer(user: { id: string; email: string }): Promise<EarlyAccessOffer> {
  const none: EarlyAccessOffer = { pending: false, placesLeft: 0, linkSentAt: null };
  const admin = createSupabaseAdminClient();
  if (!admin || !getEmailConfig() || isDisposableEmail(user.email)) return none;
  const { data: profile } = await admin
    .from("profiles")
    .select("early_access_at, early_access_token_sent_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.early_access_at) return none;
  const placesLeft = await earlyAccessPlacesLeft();
  if (placesLeft === 0) return none;
  return { pending: true, placesLeft, linkSentAt: profile.early_access_token_sent_at };
}

export type ResendResult = "sent" | "too_soon" | "unavailable";

/** "Send me the link again", limited to one e-mail a minute. */
export async function resendEarlyAccessEmail(user: { id: string; email: string }): Promise<ResendResult> {
  const config = getEmailConfig();
  const offer = await getEarlyAccessOffer(user);
  if (!config || !offer.pending) return "unavailable";
  if (offer.linkSentAt && Date.now() - new Date(offer.linkSentAt).getTime() < EARLY_ACCESS_RESEND_SECONDS * 1000) return "too_soon";

  const link = await createEarlyAccessLink(user);
  if (!link) return "unavailable";
  const result = await sendEmail(config, {
    to: user.email,
    ...buildEarlyAccessEmail(link, offer.placesLeft),
    idempotencyKey: `early-access-${user.id}-${Date.now()}`,
    replyTo: getLegalInfo().contactEmail ?? undefined,
  });
  if (!result.ok) {
    console.error("Early access e-mail failed", result.error);
    return "unavailable";
  }
  return "sent";
}
