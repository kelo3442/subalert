import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS } from "./plan";

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
