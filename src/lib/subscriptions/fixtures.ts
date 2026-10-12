import type { Subscription } from "./types";

export function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    name: "Netflix",
    amountCents: 4900,
    amountIsEstimate: false,
    currency: "PLN",
    billingCycle: "monthly",
    nextPaymentDate: "2026-10-20",
    trialEndsAt: null,
    category: "video",
    manageUrl: null,
    notes: null,
    status: "active",
    cancelledAt: null,
    createdAt: "2026-10-01T10:00:00Z",
    ...overrides,
  };
}
