import { addDays, nextDateForDayOfMonth, type ISODate } from "@/lib/dates";
import { scheduleBetween } from "@/lib/subscriptions/schedule";
import type { Subscription } from "@/lib/subscriptions/types";

/** The next payday after today (on payday itself, the following month's). */
export function nextPayday(today: ISODate, payday: number): ISODate {
  return nextDateForDayOfMonth(addDays(today, 1), payday);
}

export interface UntilPayday {
  payday: ISODate;
  totalCents: number;
  /** True when at least one of the payments is an estimate (e.g. electricity). */
  estimate: boolean;
  payments: { name: string; date: ISODate; amountCents: number }[];
}

/** Fixed payments from today until the day before the next payday. */
export function paymentsUntilPayday(subscriptions: Subscription[], today: ISODate, payday: number): UntilPayday {
  const next = nextPayday(today, payday);
  const events = scheduleBetween(subscriptions, today, today, addDays(next, -1)).filter((e) => e.kind === "payment");
  return {
    payday: next,
    totalCents: events.reduce((sum, e) => sum + e.subscription.amountCents, 0),
    estimate: events.some((e) => e.subscription.amountIsEstimate),
    payments: events.map((e) => ({ name: e.subscription.name, date: e.date, amountCents: e.subscription.amountCents })),
  };
}
