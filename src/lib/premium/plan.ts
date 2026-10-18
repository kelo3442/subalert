import { isPremiumSalesOpen } from "@/lib/env";

/** Active subscriptions allowed on the free plan. Keep in sync with the SQL trigger. */
export const FREE_PLAN_LIMIT = 3;

/** Launch promotion: the first EARLY_ACCESS_LIMIT accounts get Premium free for EARLY_ACCESS_MONTHS. */
export const EARLY_ACCESS_LIMIT = 100;
export const EARLY_ACCESS_MONTHS = 6;

export const PREMIUM_PLANS = {
  monthly: { cents: 999, label: "9,99 zł / miesiąc" },
  yearly: { cents: 7900, label: "79 zł / rok" },
} as const;
export type PremiumPlan = keyof typeof PREMIUM_PLANS;

export const FREE_PLAN_LIMIT_MESSAGE = isPremiumSalesOpen()
  ? `Darmowy plan obejmuje ${FREE_PLAN_LIMIT} aktywne pozycje. Przejdź na Premium, aby dodać więcej bez limitu.`
  : `Darmowy plan obejmuje ${FREE_PLAN_LIMIT} aktywne pozycje. Premium bez limitu będzie dostępne wkrótce — zapisz się, a damy Ci znać.`;

export function isPremiumActive(premiumUntil: string | null, now: Date = new Date()): boolean {
  return premiumUntil !== null && new Date(premiumUntil).getTime() > now.getTime();
}

/** The database trigger rejects inserts over the free limit with this message. */
export function isFreePlanLimitError(error: { message?: string } | null | undefined): boolean {
  return Boolean(error?.message?.includes("free_plan_limit"));
}

/** Remaining free slots, or null for Premium (no limit). */
export function freeSlotsLeft(activeCount: number, premium: boolean): number | null {
  return premium ? null : Math.max(0, FREE_PLAN_LIMIT - activeCount);
}
