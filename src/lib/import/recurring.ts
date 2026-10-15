import { compareISODates, daysBetween, type ISODate } from "@/lib/dates";
import { nextPaymentOnOrAfter, nthPaymentDate, type BillingCycle } from "@/lib/subscriptions/billing";
import type { CategoryKey } from "@/lib/subscriptions/categories";
import { matchServiceInDescription } from "@/lib/subscriptions/popular-services";
import type { Transaction } from "./statement";

export interface RecurringCandidate {
  key: string;
  name: string;
  category: CategoryKey | null;
  manageUrl: string | null;
  knownService: boolean;
  amountCents: number;
  cycle: BillingCycle;
  occurrences: number;
  lastDate: ISODate;
  nextPaymentDate: ISODate;
  /** The last charge is overdue by more than half a cycle — maybe already cancelled. */
  possiblyInactive: boolean;
  /** A known service charged only once in the file; the cycle is assumed to be monthly. */
  singleCharge: boolean;
}

const CYCLE_RANGES: { cycle: BillingCycle; min: number; max: number; days: number }[] = [
  { cycle: "weekly", min: 6, max: 8, days: 7 },
  { cycle: "monthly", min: 26, max: 35, days: 30 },
  { cycle: "bimonthly", min: 55, max: 67, days: 61 },
  { cycle: "quarterly", min: 84, max: 98, days: 91 },
  { cycle: "semiannual", min: 170, max: 195, days: 182 },
  { cycle: "yearly", min: 350, max: 380, days: 365 },
];

const NOISE_WORDS = new Set([
  "platnosc", "płatność", "platnosci", "płatności", "karta", "kartą", "karty", "zakup", "transakcja",
  "transakcji", "blik", "przelew", "zlecenie", "stałe", "stale", "pln", "eur", "usd", "www", "com", "http",
  "https", "ref", "nr", "data", "operacji", "card", "payment", "visa", "mastercard", "debit", "obciążenie",
  "obciazenie", "internet", "mobile", "web", "dla", "the", "inc", "ltd", "sp", "zoo", "z.o.o", "s.a",
]);

/** Groups descriptions that differ only by dates, card numbers or references. */
export function merchantKey(description: string): string {
  const tokens = description
    .toLocaleLowerCase("pl")
    .replace(/[^a-ząćęłńóśźż\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !NOISE_WORDS.has(token));
  return tokens.slice(0, 3).join(" ");
}

function displayName(key: string): string {
  return key
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("pl") + word.slice(1))
    .join(" ");
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const AMOUNT_TOLERANCE = 0.2;

/**
 * Finds payments repeating at a regular interval with a similar amount; the
 * latest amount is used as the current price. Known services are also
 * suggested after a single charge.
 */
export function detectRecurring(transactions: Transaction[], today: ISODate): RecurringCandidate[] {
  const groups = new Map<string, { known: ReturnType<typeof matchServiceInDescription>; items: Transaction[] }>();
  for (const transaction of transactions) {
    const known = matchServiceInDescription(transaction.description);
    const key = known ? `known:${known.name}` : merchantKey(transaction.description);
    if (!key) continue;
    const group = groups.get(key) ?? { known, items: [] };
    group.items.push(transaction);
    groups.set(key, group);
  }

  const candidates: RecurringCandidate[] = [];
  for (const [key, { known, items }] of groups) {
    if (items.length < 2) continue;
    const sorted = [...items].sort((a, b) => compareISODates(a.date, b.date));

    // Keep the charges whose amount is close to the typical one (ignores one-off purchases).
    const typical = median(sorted.map((t) => t.amountCents));
    const similar = sorted.filter((t) => Math.abs(t.amountCents - typical) <= typical * AMOUNT_TOLERANCE);
    if (similar.length < 2) continue;

    const gaps = similar.slice(1).map((t, i) => daysBetween(similar[i].date, t.date)).filter((gap) => gap > 0);
    if (gaps.length === 0) continue;
    const range = CYCLE_RANGES.find((r) => median(gaps) >= r.min && median(gaps) <= r.max);
    if (!range) continue;
    const regular = gaps.filter((gap) => gap >= range.min && gap <= range.max).length;
    if (regular / gaps.length < 0.6) continue;

    const last = similar[similar.length - 1];
    const expected = nthPaymentDate(last.date, range.cycle, 1);
    candidates.push({
      key,
      name: known?.name ?? displayName(key),
      category: known?.category ?? null,
      manageUrl: known?.manageUrl ?? null,
      knownService: Boolean(known),
      amountCents: last.amountCents,
      cycle: range.cycle,
      occurrences: similar.length,
      lastDate: last.date,
      nextPaymentDate: nextPaymentOnOrAfter(expected, range.cycle, today),
      possiblyInactive: daysBetween(expected, today) > range.days / 2,
      singleCharge: false,
    });
  }

  // Well-known services are worth suggesting even after a single charge (short statements,
  // new subscriptions). Most of them bill monthly; the user can change the cycle later.
  const found = new Set(candidates.map((c) => c.key));
  for (const [key, { known, items }] of groups) {
    if (!known || found.has(key)) continue;
    const last = [...items].sort((a, b) => compareISODates(a.date, b.date)).at(-1)!;
    const expected = nthPaymentDate(last.date, "monthly", 1);
    candidates.push({
      key,
      name: known.name,
      category: known.category,
      manageUrl: known.manageUrl,
      knownService: true,
      amountCents: last.amountCents,
      cycle: "monthly",
      occurrences: items.length,
      lastDate: last.date,
      nextPaymentDate: nextPaymentOnOrAfter(expected, "monthly", today),
      possiblyInactive: daysBetween(expected, today) > 15,
      singleCharge: true,
    });
  }

  return candidates.sort(
    (a, b) =>
      Number(a.possiblyInactive) - Number(b.possiblyInactive) ||
      Number(b.knownService) - Number(a.knownService) ||
      b.amountCents - a.amountCents,
  );
}
