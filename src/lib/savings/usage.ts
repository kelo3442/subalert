import { addMonthsClamped, type ISODate } from "@/lib/dates";
import { BILL_CATEGORIES } from "@/lib/subscriptions/categories";
import type { Subscription } from "@/lib/subscriptions/types";

export interface UsageAnswer {
  subscriptionId: string;
  /** First day of the month the answer is for. */
  month: ISODate;
  used: boolean;
}

export const MAX_QUESTIONS = 5;

export function monthStart(today: ISODate): ISODate {
  return `${today.slice(0, 7)}-01`;
}

/** Plans worth asking about: active, not a bill, added at least two weeks ago. */
function askable(subscription: Subscription, today: ISODate): boolean {
  if (subscription.status !== "active") return false;
  if (subscription.category && BILL_CATEGORIES.includes(subscription.category)) return false;
  const added = subscription.createdAt.slice(0, 10);
  return Date.parse(today) - Date.parse(added) >= 14 * 86_400_000;
}

/** "Korzystałeś z tego w ostatnim miesiącu?" — plans not answered yet this month. */
export function usageQuestions(subscriptions: Subscription[], answers: UsageAnswer[], today: ISODate): Subscription[] {
  const month = monthStart(today);
  const answered = new Set(answers.filter((a) => a.month === month).map((a) => a.subscriptionId));
  return subscriptions.filter((s) => askable(s, today) && !answered.has(s.id)).slice(0, MAX_QUESTIONS);
}

export interface UnusedPlan {
  subscription: Subscription;
  /** Months in a row (up to the latest answer) the user said "nie". */
  months: number;
  /** Month of the latest "nie", part of the dismiss key so a later "nie" asks again. */
  month: ISODate;
}

/** Active plans whose latest answer, this month or last, was "not used". */
export function unusedPlans(subscriptions: Subscription[], answers: UsageAnswer[], today: ISODate): UnusedPlan[] {
  const recent = addMonthsClamped(monthStart(today), -1);
  const result: UnusedPlan[] = [];
  for (const subscription of subscriptions) {
    if (subscription.status !== "active") continue;
    const mine = answers.filter((a) => a.subscriptionId === subscription.id).sort((a, b) => b.month.localeCompare(a.month));
    const latest = mine[0];
    if (!latest || latest.used || latest.month < recent) continue;
    let months = 0;
    let expected = latest.month;
    for (const answer of mine) {
      if (answer.month !== expected || answer.used) break;
      months += 1;
      expected = addMonthsClamped(expected, -1);
    }
    result.push({ subscription, months, month: latest.month });
  }
  return result;
}
