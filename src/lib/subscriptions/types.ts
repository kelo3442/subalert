import type { ISODate } from "@/lib/dates";
import type { BillingCycle } from "./billing";
import type { CategoryKey } from "./categories";

export const SUBSCRIPTION_STATUSES = ["active", "cancelled"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface Subscription {
  id: string;
  name: string;
  amountCents: number;
  /** Variable bills (e.g. electricity): the amount is the user's estimate. */
  amountIsEstimate: boolean;
  currency: "PLN";
  billingCycle: BillingCycle;
  /** The next charge the user told us about; later charges are derived from it. */
  nextPaymentDate: ISODate;
  trialEndsAt: ISODate | null;
  category: CategoryKey | null;
  manageUrl: string | null;
  notes: string | null;
  status: SubscriptionStatus;
  cancelledAt: string | null;
  createdAt: string;
}
