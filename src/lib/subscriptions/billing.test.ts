import { describe, expect, it } from "vitest";
import {
  monthlyCostCents,
  nextPaymentOnOrAfter,
  nthPaymentDate,
  paymentDatesBetween,
  totalCosts,
  yearlyCostCents,
} from "./billing";

describe("costs", () => {
  it("normalises each cycle", () => {
    expect(yearlyCostCents(1000, "weekly")).toBe(52_000);
    expect(yearlyCostCents(4999, "monthly")).toBe(59_988);
    expect(yearlyCostCents(9000, "quarterly")).toBe(36_000);
    expect(yearlyCostCents(24_000, "yearly")).toBe(24_000);
    expect(monthlyCostCents(1000, "weekly")).toBe(4333);
    expect(monthlyCostCents(9000, "quarterly")).toBe(3000);
    expect(monthlyCostCents(9999, "yearly")).toBe(833);
  });

  it("supports bill cycles", () => {
    expect(yearlyCostCents(18_000, "bimonthly")).toBe(108_000);
    expect(monthlyCostCents(18_000, "bimonthly")).toBe(9000);
    expect(yearlyCostCents(60_000, "semiannual")).toBe(120_000);
    expect(monthlyCostCents(60_000, "semiannual")).toBe(10_000);
  });

  it("sums without accumulating rounding errors", () => {
    const items = Array.from({ length: 3 }, () => ({ amountCents: 1000, billingCycle: "yearly" as const }));
    // 3 × 10 zł / 12 = 2,50 zł; per-item rounding would give 3 × 0,83 = 2,49 zł
    expect(totalCosts(items)).toEqual({ yearlyCents: 3000, monthlyCents: 250 });
  });

  it("mixes cycles", () => {
    expect(
      totalCosts([
        { amountCents: 4300, billingCycle: "monthly" },
        { amountCents: 1999, billingCycle: "monthly" },
        { amountCents: 24_900, billingCycle: "yearly" },
        { amountCents: 500, billingCycle: "weekly" },
      ]),
    ).toEqual({ yearlyCents: 4300 * 12 + 1999 * 12 + 24_900 + 500 * 52, monthlyCents: 10_541 });
  });

  it("returns zero for no subscriptions", () => {
    expect(totalCosts([])).toEqual({ monthlyCents: 0, yearlyCents: 0 });
  });
});

describe("payment dates", () => {
  it("advances every cycle", () => {
    expect(nthPaymentDate("2026-10-12", "weekly", 3)).toBe("2026-11-02");
    expect(nthPaymentDate("2026-10-12", "monthly", 3)).toBe("2027-01-12");
    expect(nthPaymentDate("2026-10-12", "quarterly", 2)).toBe("2027-04-12");
    expect(nthPaymentDate("2026-10-12", "yearly", 1)).toBe("2027-10-12");
  });

  it("advances bill cycles from the anchor", () => {
    expect(paymentDatesBetween("2026-01-31", "bimonthly", "2026-01-01", "2026-12-31")).toEqual([
      "2026-01-31",
      "2026-03-31",
      "2026-05-31",
      "2026-07-31",
      "2026-09-30",
      "2026-11-30",
    ]);
    expect(nextPaymentOnOrAfter("2025-08-31", "semiannual", "2026-10-12")).toBe("2027-02-28");
  });

  it("keeps the 31st after a short month", () => {
    expect(paymentDatesBetween("2026-01-31", "monthly", "2026-01-01", "2026-05-31")).toEqual([
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-04-30",
      "2026-05-31",
    ]);
  });

  it("handles leap-day yearly plans", () => {
    expect(nthPaymentDate("2024-02-29", "yearly", 1)).toBe("2025-02-28");
    expect(nthPaymentDate("2024-02-29", "yearly", 4)).toBe("2028-02-29");
  });

  it("rolls a stale date forward to today or later", () => {
    expect(nextPaymentOnOrAfter("2026-01-15", "monthly", "2026-10-12")).toBe("2026-10-15");
    expect(nextPaymentOnOrAfter("2026-10-12", "monthly", "2026-10-12")).toBe("2026-10-12");
    expect(nextPaymentOnOrAfter("2026-12-20", "monthly", "2026-10-12")).toBe("2026-12-20");
    expect(nextPaymentOnOrAfter("2020-03-01", "weekly", "2026-10-12")).toBe("2026-10-18");
    expect(nextPaymentOnOrAfter("2025-11-30", "quarterly", "2026-10-12")).toBe("2026-11-30");
    expect(nextPaymentOnOrAfter("2019-05-31", "yearly", "2026-10-12")).toBe("2027-05-31");
  });

  it("crosses the year boundary", () => {
    expect(paymentDatesBetween("2026-12-25", "weekly", "2026-12-20", "2027-01-10")).toEqual([
      "2026-12-25",
      "2027-01-01",
      "2027-01-08",
    ]);
  });

  it("returns nothing for an empty range", () => {
    expect(paymentDatesBetween("2026-10-15", "monthly", "2026-10-16", "2026-11-14")).toEqual([]);
  });
});
