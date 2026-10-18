import "server-only";
import { cache } from "react";
import { FREE_PLAN_LIMIT, freeSlotsLeft, isPremiumActive } from "@/lib/premium/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "./user";

export interface PlanStatus {
  premium: boolean;
  premiumUntil: string | null;
  premiumSource: "subscription" | "one_time" | "early_access" | null;
  hasStripeCustomer: boolean;
  activeCount: number;
  limit: number;
  /** Remaining free slots; null on Premium. */
  slotsLeft: number | null;
}

export const getPlanStatus = cache(async (): Promise<PlanStatus> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("premium_until, premium_source, stripe_customer_id").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
  ]);
  const premium = isPremiumActive(profile?.premium_until ?? null);
  const activeCount = count ?? 0;
  return {
    premium,
    premiumUntil: profile?.premium_until ?? null,
    premiumSource: profile?.premium_source ?? null,
    hasStripeCustomer: Boolean(profile?.stripe_customer_id),
    activeCount,
    limit: FREE_PLAN_LIMIT,
    slotsLeft: freeSlotsLeft(activeCount, premium),
  };
});
