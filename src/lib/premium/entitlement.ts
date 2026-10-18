const DAY_MS = 86_400_000;
export const ONE_TIME_PREMIUM_DAYS = 365;

/** Minimal shape of the Stripe event objects this app reacts to. */
export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

export interface ProfileBilling {
  premiumUntil: string | null;
  premiumSource: "subscription" | "one_time" | "early_access" | null;
}

export interface EntitlementChange {
  /** How to find the user: metadata.user_id first, otherwise the Stripe customer. */
  userId: string | null;
  customerId: string | null;
  update: {
    premium_until?: string | null;
    premium_source?: "subscription" | "one_time" | "early_access";
    stripe_customer_id?: string;
    stripe_subscription_id?: string | null;
  };
}

const str = (value: unknown): string | null => (typeof value === "string" && value ? value : null);
const meta = (object: Record<string, unknown>) => (object.metadata ?? {}) as Record<string, unknown>;

/** Period end of a subscription (older API versions expose it on the subscription, newer on its items). */
function periodEnd(subscription: Record<string, unknown>): number | null {
  if (typeof subscription.current_period_end === "number") return subscription.current_period_end;
  const items = (subscription.items as { data?: { current_period_end?: number }[] } | undefined)?.data;
  return typeof items?.[0]?.current_period_end === "number" ? items[0].current_period_end : null;
}

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);
const ENDED_STATUSES = new Set(["canceled", "unpaid", "incomplete_expired", "paused"]);

/** What the webhook should write for an event; null for events that change nothing. */
export function entitlementChange(
  event: StripeEvent,
  current: ProfileBilling | null,
  now: Date = new Date(),
): EntitlementChange | null {
  const object = event.data.object;

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const userId = str(object.client_reference_id) ?? str(meta(object).user_id);
    const customerId = str(object.customer);
    if (object.mode === "payment") {
      if (object.payment_status !== "paid" || meta(object).plan !== "yearly") return null;
      // Extends from the later of now and an existing one-time end date.
      const base = Math.max(now.getTime(), current?.premiumUntil ? new Date(current.premiumUntil).getTime() : 0);
      return {
        userId,
        customerId,
        update: {
          premium_until: new Date(base + ONE_TIME_PREMIUM_DAYS * DAY_MS).toISOString(),
          premium_source: "one_time",
          ...(customerId ? { stripe_customer_id: customerId } : {}),
        },
      };
    }
    if (object.mode === "subscription") {
      return {
        userId,
        customerId,
        update: {
          ...(customerId ? { stripe_customer_id: customerId } : {}),
          stripe_subscription_id: str(object.subscription),
        },
      };
    }
    return null;
  }

  if (event.type.startsWith("customer.subscription.")) {
    const userId = str(meta(object).user_id);
    const customerId = str(object.customer);
    const status = str(object.status) ?? "";
    const end = periodEnd(object);
    const ended = event.type === "customer.subscription.deleted" || ENDED_STATUSES.has(status);
    // "incomplete": the first payment is still being processed; wait for the next event.
    if (!ended && !ACTIVE_STATUSES.has(status)) return null;

    if (ended) {
      // Do not cut short a separately bought one-time year or the free launch Premium.
      if (current?.premiumSource === "one_time" || current?.premiumSource === "early_access") return null;
      const endedAt = typeof object.ended_at === "number" ? object.ended_at * 1000 : now.getTime();
      return { userId, customerId, update: { premium_until: new Date(endedAt).toISOString(), stripe_subscription_id: null } };
    }
    if (!end) return null;
    const subscriptionEnd = end * 1000;
    const keepLonger = current?.premiumUntil && new Date(current.premiumUntil).getTime() > subscriptionEnd;
    return {
      userId,
      customerId,
      update: {
        premium_until: keepLonger ? current!.premiumUntil : new Date(subscriptionEnd).toISOString(),
        premium_source: keepLonger ? current!.premiumSource ?? "subscription" : "subscription",
        ...(customerId ? { stripe_customer_id: customerId } : {}),
        stripe_subscription_id: str(object.id),
      },
    };
  }

  return null;
}
