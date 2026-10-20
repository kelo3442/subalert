import type { ISODate } from "@/lib/dates";
import type { Subscription } from "@/lib/subscriptions/types";
import { cheaperOffers } from "./offers";
import { findOverlaps } from "./overlaps";
import { unusedPlans, usageQuestions, type UsageAnswer } from "./usage";

/** How many things wait on the savings tab: open tips plus unanswered "did you use it?" questions. */
export function savingsAttention(
  subscriptions: Subscription[],
  answers: UsageAnswer[],
  dismissedTips: string[],
  today: ISODate,
  ready: boolean,
): number {
  if (!ready) return 0;
  const dismissed = new Set(dismissedTips);
  const tips =
    findOverlaps(subscriptions).filter((o) => !dismissed.has(o.key)).length +
    unusedPlans(subscriptions, answers, today).filter((u) => !dismissed.has(`unused:${u.subscription.id},${u.month}`)).length;
  const cheaper = cheaperOffers(subscriptions).filter((t) => !dismissed.has(t.key)).length;
  return tips + cheaper + usageQuestions(subscriptions, answers, today).length;
}
