import { addDays, compareISODates, daysBetween, type ISODate } from "@/lib/dates";
import { monthlyCostCents, nextPaymentOnOrAfter, paymentDatesBetween, totalCosts } from "./billing";
import { CATEGORY_KEYS, type CategoryKey } from "./categories";
import type { Subscription } from "./types";

export const NEAR_PAYMENT_DAYS = 3;

export type ScheduleEventKind = "payment" | "trial_end";

export interface ScheduleEvent {
  kind: ScheduleEventKind;
  date: ISODate;
  daysUntil: number;
  subscription: Subscription;
}

export function activeSubscriptions(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter((subscription) => subscription.status === "active");
}

export function nextPaymentDate(subscription: Subscription, today: ISODate): ISODate {
  return nextPaymentOnOrAfter(subscription.nextPaymentDate, subscription.billingCycle, today);
}

function compareEvents(a: ScheduleEvent, b: ScheduleEvent): number {
  return (
    compareISODates(a.date, b.date) ||
    (a.kind === b.kind ? 0 : a.kind === "trial_end" ? -1 : 1) ||
    a.subscription.name.localeCompare(b.subscription.name, "pl")
  );
}

/** Charges and trial endings of active subscriptions in [from, to], sorted by date. */
export function scheduleBetween(
  subscriptions: Subscription[],
  today: ISODate,
  from: ISODate,
  to: ISODate,
): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  for (const subscription of activeSubscriptions(subscriptions)) {
    for (const date of paymentDatesBetween(
      subscription.nextPaymentDate,
      subscription.billingCycle,
      from,
      to,
    )) {
      events.push({ kind: "payment", date, daysUntil: daysBetween(today, date), subscription });
    }
    const trialEnd = subscription.trialEndsAt;
    if (trialEnd && compareISODates(trialEnd, from) >= 0 && compareISODates(trialEnd, to) <= 0) {
      events.push({
        kind: "trial_end",
        date: trialEnd,
        daysUntil: daysBetween(today, trialEnd),
        subscription,
      });
    }
  }
  return events.sort(compareEvents);
}

export function upcomingEvents(
  subscriptions: Subscription[],
  today: ISODate,
  horizonDays: number,
): ScheduleEvent[] {
  return scheduleBetween(subscriptions, today, today, addDays(today, horizonDays));
}

export interface DashboardSummary {
  monthlyCents: number;
  yearlyCents: number;
  activeCount: number;
  cancelledCount: number;
  next30DaysCents: number;
  nextPayment: ScheduleEvent | null;
}

export function summarize(subscriptions: Subscription[], today: ISODate): DashboardSummary {
  const active = activeSubscriptions(subscriptions);
  const { monthlyCents, yearlyCents } = totalCosts(active);
  const payments = upcomingEvents(active, today, 30).filter((event) => event.kind === "payment");
  const nextPayment =
    active
      .map((subscription): ScheduleEvent => {
        const date = nextPaymentDate(subscription, today);
        return { kind: "payment", date, daysUntil: daysBetween(today, date), subscription };
      })
      .sort(compareEvents)[0] ?? null;

  return {
    monthlyCents,
    yearlyCents,
    activeCount: active.length,
    cancelledCount: subscriptions.length - active.length,
    next30DaysCents: payments.reduce((sum, event) => sum + event.subscription.amountCents, 0),
    nextPayment,
  };
}

export interface CategoryShare {
  category: CategoryKey;
  monthlyCents: number;
  share: number;
  count: number;
}

export function categoryBreakdown(subscriptions: Subscription[]): CategoryShare[] {
  const totals = new Map<CategoryKey, { monthlyCents: number; count: number }>();
  for (const subscription of activeSubscriptions(subscriptions)) {
    const key = subscription.category ?? "other";
    const entry = totals.get(key) ?? { monthlyCents: 0, count: 0 };
    entry.monthlyCents += monthlyCostCents(subscription.amountCents, subscription.billingCycle);
    entry.count += 1;
    totals.set(key, entry);
  }
  const overall = [...totals.values()].reduce((sum, entry) => sum + entry.monthlyCents, 0);
  return CATEGORY_KEYS.filter((key) => totals.has(key))
    .map((category) => {
      const { monthlyCents, count } = totals.get(category)!;
      return { category, monthlyCents, count, share: overall > 0 ? monthlyCents / overall : 0 };
    })
    .sort((a, b) => b.monthlyCents - a.monthlyCents);
}

/** Active trials that have not ended yet, soonest first. */
export function activeTrials(subscriptions: Subscription[], today: ISODate): Subscription[] {
  return activeSubscriptions(subscriptions)
    .filter((s) => s.trialEndsAt !== null && compareISODates(s.trialEndsAt, today) >= 0)
    .sort((a, b) => compareISODates(a.trialEndsAt!, b.trialEndsAt!));
}
