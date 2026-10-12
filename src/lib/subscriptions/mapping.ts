import { isValidISODate } from "@/lib/dates";
import { BILLING_CYCLES, type BillingCycle } from "./billing";
import { isCategoryKey } from "./categories";
import type { Subscription } from "./types";

export interface SubscriptionRow {
  id: string;
  name: string;
  amount_cents: number;
  amount_is_estimate: boolean;
  currency: string;
  billing_cycle: string;
  next_payment_date: string;
  trial_ends_at: string | null;
  category: string | null;
  manage_url: string | null;
  notes: string | null;
  status: string;
  cancelled_at: string | null;
  created_at: string;
}

function isBillingCycle(value: string): value is BillingCycle {
  return (BILLING_CYCLES as readonly string[]).includes(value);
}

/** Converts a database row to the domain model; returns null for corrupt rows. */
export function subscriptionFromRow(row: SubscriptionRow): Subscription | null {
  if (!isBillingCycle(row.billing_cycle) || !isValidISODate(row.next_payment_date)) return null;
  return {
    id: row.id,
    name: row.name,
    amountCents: row.amount_cents,
    amountIsEstimate: row.amount_is_estimate,
    currency: "PLN",
    billingCycle: row.billing_cycle,
    nextPaymentDate: row.next_payment_date,
    trialEndsAt: row.trial_ends_at && isValidISODate(row.trial_ends_at) ? row.trial_ends_at : null,
    category: row.category && isCategoryKey(row.category) ? row.category : null,
    manageUrl: row.manage_url,
    notes: row.notes,
    status: row.status === "cancelled" ? "cancelled" : "active",
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
  };
}

export const SUBSCRIPTION_COLUMNS =
  "id, name, amount_cents, amount_is_estimate, currency, billing_cycle, next_payment_date, trial_ends_at, category, manage_url, notes, status, cancelled_at, created_at";
