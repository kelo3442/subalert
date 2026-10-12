import { addDays, addMonthsClamped, compareISODates, daysBetween, type ISODate } from "@/lib/dates";

export const BILLING_CYCLES = ["weekly", "monthly", "bimonthly", "quarterly", "semiannual", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Tygodniowy",
  monthly: "Miesięczny",
  bimonthly: "Co 2 miesiące",
  quarterly: "Kwartalny",
  semiannual: "Półroczny",
  yearly: "Roczny",
};

export const BILLING_CYCLE_SUFFIX: Record<BillingCycle, string> = {
  weekly: "tydz.",
  monthly: "mies.",
  bimonthly: "2 mies.",
  quarterly: "kw.",
  semiannual: "pół roku",
  yearly: "rok",
};

/** A weekly plan is counted as 52 charges per year. */
export const PAYMENTS_PER_YEAR: Record<BillingCycle, number> = {
  weekly: 52,
  monthly: 12,
  bimonthly: 6,
  quarterly: 4,
  semiannual: 2,
  yearly: 1,
};

/** Upper bound of a cycle's length in days, used to estimate skipped cycles. */
const MAX_CYCLE_DAYS: Record<BillingCycle, number> = {
  weekly: 7,
  monthly: 31,
  bimonthly: 62,
  quarterly: 92,
  semiannual: 184,
  yearly: 366,
};

export function yearlyCostCents(amountCents: number, cycle: BillingCycle): number {
  return amountCents * PAYMENTS_PER_YEAR[cycle];
}

export function monthlyCostCents(amountCents: number, cycle: BillingCycle): number {
  return Math.round(yearlyCostCents(amountCents, cycle) / 12);
}

export interface CostTotals {
  monthlyCents: number;
  yearlyCents: number;
}

/**
 * Sums yearly costs first and divides once, so rounding errors do not
 * accumulate across many subscriptions.
 */
export function totalCosts(items: { amountCents: number; billingCycle: BillingCycle }[]): CostTotals {
  const yearlyCents = items.reduce(
    (sum, item) => sum + yearlyCostCents(item.amountCents, item.billingCycle),
    0,
  );
  return { yearlyCents, monthlyCents: Math.round(yearlyCents / 12) };
}

/**
 * The n-th charge counted from the anchor (n = 0 is the anchor itself).
 * Always computed from the anchor, so a charge on the 31st returns to the
 * 31st after shorter months instead of drifting to the 28th.
 */
export function nthPaymentDate(anchor: ISODate, cycle: BillingCycle, n: number): ISODate {
  switch (cycle) {
    case "weekly":
      return addDays(anchor, 7 * n);
    case "monthly":
      return addMonthsClamped(anchor, n);
    case "bimonthly":
      return addMonthsClamped(anchor, 2 * n);
    case "quarterly":
      return addMonthsClamped(anchor, 3 * n);
    case "semiannual":
      return addMonthsClamped(anchor, 6 * n);
    case "yearly":
      return addMonthsClamped(anchor, 12 * n);
  }
}

/** Index of the first charge falling on or after `from`. */
function firstIndexOnOrAfter(anchor: ISODate, cycle: BillingCycle, from: ISODate): number {
  if (compareISODates(anchor, from) >= 0) return 0;
  let n = Math.max(0, Math.floor(daysBetween(anchor, from) / MAX_CYCLE_DAYS[cycle]));
  while (compareISODates(nthPaymentDate(anchor, cycle, n), from) < 0) n += 1;
  return n;
}

/** The first charge on or after `from` (e.g. today), rolling a stale date forward. */
export function nextPaymentOnOrAfter(anchor: ISODate, cycle: BillingCycle, from: ISODate): ISODate {
  return nthPaymentDate(anchor, cycle, firstIndexOnOrAfter(anchor, cycle, from));
}

/** All charges within the inclusive range [from, to]. */
export function paymentDatesBetween(
  anchor: ISODate,
  cycle: BillingCycle,
  from: ISODate,
  to: ISODate,
): ISODate[] {
  const dates: ISODate[] = [];
  for (let n = firstIndexOnOrAfter(anchor, cycle, from); ; n += 1) {
    const date = nthPaymentDate(anchor, cycle, n);
    if (compareISODates(date, to) > 0) break;
    dates.push(date);
  }
  return dates;
}
