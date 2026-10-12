import type { BillingCycle } from "@/lib/subscriptions/billing";
import type { CategoryKey } from "@/lib/subscriptions/categories";

export interface QuickStartEntry {
  key: string;
  name: string;
  category: CategoryKey | null;
  manageUrl: string | null;
  custom: boolean;
  amount: string;
  cycle: BillingCycle;
  /** Day of month for monthly plans ("" until chosen). */
  day: string;
  /** Full date for other cycles. */
  date: string;
}
