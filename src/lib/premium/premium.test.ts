import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { entitlementChange, type StripeEvent } from "./entitlement";
import { FREE_PLAN_LIMIT, freeSlotsLeft, isFreePlanLimitError, isPremiumActive, placesWord } from "./plan";
import { verifyStripeSignature } from "./stripe-signature";

const SECRET = "whsec_test";
const sign = (payload: string, t: number, secret = SECRET) =>
  `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex")}`;

describe("verifyStripeSignature", () => {
  const payload = '{"id":"evt_1"}';
  const now = 1_800_000_000;

  it("accepts a valid signature", () => {
    expect(verifyStripeSignature(payload, sign(payload, now), SECRET, now)).toBe(true);
    expect(verifyStripeSignature(payload, `${sign(payload, now)},v1=deadbeef`, SECRET, now)).toBe(true);
  });

  it("rejects tampering, wrong secrets, replays and junk", () => {
    expect(verifyStripeSignature('{"id":"evt_2"}', sign(payload, now), SECRET, now)).toBe(false);
    expect(verifyStripeSignature(payload, sign(payload, now, "other"), SECRET, now)).toBe(false);
    expect(verifyStripeSignature(payload, sign(payload, now - 301), SECRET, now)).toBe(false);
    expect(verifyStripeSignature(payload, null, SECRET, now)).toBe(false);
    expect(verifyStripeSignature(payload, "garbage", SECRET, now)).toBe(false);
  });
});

describe("plan helpers", () => {
  it("knows the free limit and premium state", () => {
    expect(FREE_PLAN_LIMIT).toBe(3);
    expect(freeSlotsLeft(1, false)).toBe(2);
    expect(freeSlotsLeft(5, false)).toBe(0);
    expect(freeSlotsLeft(5, true)).toBeNull();
    const now = new Date("2026-10-12T10:00:00Z");
    expect(isPremiumActive("2026-10-13T00:00:00Z", now)).toBe(true);
    expect(isPremiumActive("2026-10-12T09:00:00Z", now)).toBe(false);
    expect(isPremiumActive(null, now)).toBe(false);
    expect(isFreePlanLimitError({ message: "free_plan_limit" })).toBe(true);
    expect(isFreePlanLimitError({ message: "other" })).toBe(false);
  });
});

describe("entitlementChange", () => {
  const now = new Date("2026-10-12T10:00:00Z");
  const event = (type: string, object: Record<string, unknown>): StripeEvent => ({ id: "evt", type, data: { object } });

  it("gives a year of Premium for a paid one-time yearly checkout", () => {
    const change = entitlementChange(
      event("checkout.session.completed", {
        mode: "payment",
        payment_status: "paid",
        client_reference_id: "user-1",
        customer: "cus_1",
        metadata: { plan: "yearly", user_id: "user-1" },
      }),
      null,
      now,
    );
    expect(change).toEqual({
      userId: "user-1",
      customerId: "cus_1",
      update: { premium_until: "2027-10-12T10:00:00.000Z", premium_source: "one_time", stripe_customer_id: "cus_1" },
    });
  });

  it("extends an active year instead of overlapping", () => {
    const change = entitlementChange(
      event("checkout.session.completed", { mode: "payment", payment_status: "paid", client_reference_id: "u", metadata: { plan: "yearly" } }),
      { premiumUntil: "2027-01-01T00:00:00.000Z", premiumSource: "one_time" },
      now,
    );
    expect(change?.update.premium_until).toBe("2028-01-01T00:00:00.000Z");
  });

  it("waits for asynchronous payments (e.g. bank transfers) to settle", () => {
    expect(
      entitlementChange(
        event("checkout.session.completed", { mode: "payment", payment_status: "unpaid", metadata: { plan: "yearly" } }),
        null,
        now,
      ),
    ).toBeNull();
    expect(
      entitlementChange(
        event("checkout.session.async_payment_succeeded", { mode: "payment", payment_status: "paid", client_reference_id: "u", metadata: { plan: "yearly" } }),
        null,
        now,
      )?.update.premium_source,
    ).toBe("one_time");
  });

  it("sets Premium to the end of the paid subscription period", () => {
    const change = entitlementChange(
      event("customer.subscription.updated", {
        id: "sub_1",
        customer: "cus_1",
        status: "active",
        metadata: { user_id: "user-1" },
        items: { data: [{ current_period_end: Date.parse("2026-11-12T10:00:00Z") / 1000 }] },
      }),
      null,
      now,
    );
    expect(change?.update).toEqual({
      premium_until: "2026-11-12T10:00:00.000Z",
      premium_source: "subscription",
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_1",
    });
  });

  it("ends Premium when the subscription ends, but never shortens a bought year", () => {
    const deleted = event("customer.subscription.deleted", { id: "sub_1", customer: "cus_1", status: "canceled", ended_at: 1_791_799_200 });
    expect(entitlementChange(deleted, { premiumUntil: "2026-11-12T10:00:00Z", premiumSource: "subscription" }, now)?.update).toEqual({
      premium_until: new Date(1_791_799_200_000).toISOString(),
      stripe_subscription_id: null,
    });
    expect(entitlementChange(deleted, { premiumUntil: "2027-10-01T00:00:00Z", premiumSource: "one_time" }, now)).toBeNull();
    expect(entitlementChange(deleted, { premiumUntil: "2027-04-01T00:00:00Z", premiumSource: "early_access" }, now)).toBeNull();
  });

  it("waits while the first subscription payment is still incomplete", () => {
    const incomplete = event("customer.subscription.created", { id: "sub_1", customer: "cus_1", status: "incomplete", metadata: { user_id: "u" } });
    expect(entitlementChange(incomplete, null, now)).toBeNull();
  });

  it("ignores unrelated events", () => {
    expect(entitlementChange(event("invoice.created", {}), null, now)).toBeNull();
  });
});

describe("placesWord", () => {
  it("uses the right Polish form", () => {
    expect([1, 2, 3, 4, 5, 12, 22, 25, 94, 100].map((n) => `${n} ${placesWord(n)}`)).toEqual([
      "1 miejsce", "2 miejsca", "3 miejsca", "4 miejsca", "5 miejsc", "12 miejsc", "22 miejsca", "25 miejsc", "94 miejsca", "100 miejsc",
    ]);
  });
});
