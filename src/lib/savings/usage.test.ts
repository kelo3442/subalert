import { describe, expect, it } from "vitest";
import { makeSubscription } from "@/lib/subscriptions/fixtures";
import { nextPayday, paymentsUntilPayday } from "./payday";
import { unusedPlans, usageQuestions } from "./usage";

const old = { createdAt: "2026-08-01T10:00:00Z" };

describe("usageQuestions", () => {
  it("asks about optional plans not answered this month", () => {
    const netflix = makeSubscription({ name: "Netflix", ...old });
    const spotify = makeSubscription({ name: "Spotify", ...old });
    const rent = makeSubscription({ name: "Czynsz", category: "housing", ...old });
    const fresh = makeSubscription({ name: "Nowa", createdAt: "2026-10-15T10:00:00Z" });
    const asked = usageQuestions([netflix, spotify, rent, fresh], [{ subscriptionId: spotify.id, month: "2026-10-01", used: true }], "2026-10-20");
    expect(asked.map((s) => s.name)).toEqual(["Netflix"]);
  });
});

describe("unusedPlans", () => {
  it("counts months in a row without use", () => {
    const gym = makeSubscription({ name: "Siłownia", ...old });
    const answers = [
      { subscriptionId: gym.id, month: "2026-10-01", used: false },
      { subscriptionId: gym.id, month: "2026-09-01", used: false },
      { subscriptionId: gym.id, month: "2026-08-01", used: true },
    ];
    expect(unusedPlans([gym], answers, "2026-10-20")).toEqual([{ subscription: gym, months: 2, month: "2026-10-01" }]);
  });

  it("ignores used, old answers and cancelled plans", () => {
    const a = makeSubscription(old);
    const b = makeSubscription(old);
    const c = makeSubscription({ ...old, status: "cancelled" });
    const answers = [
      { subscriptionId: a.id, month: "2026-10-01", used: true },
      { subscriptionId: b.id, month: "2026-07-01", used: false },
      { subscriptionId: c.id, month: "2026-10-01", used: false },
    ];
    expect(unusedPlans([a, b, c], answers, "2026-10-20")).toEqual([]);
  });
});

describe("payday", () => {
  it("finds the next payday", () => {
    expect(nextPayday("2026-10-20", 10)).toBe("2026-11-10");
    expect(nextPayday("2026-10-05", 10)).toBe("2026-10-10");
    expect(nextPayday("2026-10-10", 10)).toBe("2026-11-10");
    expect(nextPayday("2026-02-10", 31)).toBe("2026-02-28");
  });

  it("sums payments before payday", () => {
    const result = paymentsUntilPayday(
      [
        makeSubscription({ name: "A", amountCents: 1000, nextPaymentDate: "2026-10-25" }),
        makeSubscription({ name: "B", amountCents: 2000, nextPaymentDate: "2026-11-10" }),
        makeSubscription({ name: "C", amountCents: 500, nextPaymentDate: "2026-11-09", amountIsEstimate: true }),
      ],
      "2026-10-20",
      10,
    );
    expect(result.payday).toBe("2026-11-10");
    expect(result.totalCents).toBe(1500);
    expect(result.estimate).toBe(true);
    expect(result.payments.map((p) => p.name)).toEqual(["A", "C"]);
  });
});
