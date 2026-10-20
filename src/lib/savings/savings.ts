import { BILL_CATEGORIES } from "@/lib/subscriptions/categories";
import { yearlyCostCents } from "@/lib/subscriptions/billing";
import type { Subscription } from "@/lib/subscriptions/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SavedItem {
  subscription: Subscription;
  yearlyCents: number;
  /** Money not spent since the user cancelled, prorated by days. */
  savedCents: number;
}

export interface SavingsSummary {
  /** What the cancelled plans would cost over a year. */
  yearlyCents: number;
  /** Money already kept since each plan was cancelled. */
  savedSoFarCents: number;
  items: SavedItem[];
}

/** Savings from plans the user marked as cancelled. */
export function computeSavings(subscriptions: Subscription[], now: Date = new Date()): SavingsSummary {
  const items = subscriptions
    .filter((s) => s.status === "cancelled" && s.cancelledAt)
    .map((subscription) => {
      const yearlyCents = yearlyCostCents(subscription.amountCents, subscription.billingCycle);
      const days = Math.max(0, (now.getTime() - new Date(subscription.cancelledAt as string).getTime()) / DAY_MS);
      return { subscription, yearlyCents, savedCents: Math.round((yearlyCents * days) / 365) };
    })
    .sort((a, b) => b.yearlyCents - a.yearlyCents);
  return {
    yearlyCents: items.reduce((sum, item) => sum + item.yearlyCents, 0),
    savedSoFarCents: items.reduce((sum, item) => sum + item.savedCents, 0),
    items,
  };
}

/** The most expensive active plans that are easy to drop (not rent, energy, phone or insurance). */
export function priciestOptional(subscriptions: Subscription[], limit = 3): { subscription: Subscription; yearlyCents: number }[] {
  return subscriptions
    .filter((s) => s.status === "active" && !(s.category && BILL_CATEGORIES.includes(s.category)))
    .map((subscription) => ({ subscription, yearlyCents: yearlyCostCents(subscription.amountCents, subscription.billingCycle) }))
    .sort((a, b) => b.yearlyCents - a.yearlyCents)
    .slice(0, limit);
}
