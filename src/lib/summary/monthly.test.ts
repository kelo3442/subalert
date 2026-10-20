import { describe, expect, it } from "vitest";
import { makeSubscription } from "@/lib/subscriptions/fixtures";
import { buildMonthlySummary, buildMonthlySummaryEmail } from "./monthly";

const old = { createdAt: "2026-08-01T10:00:00Z" };

describe("monthly summary", () => {
  const subs = [
    makeSubscription({ name: "Netflix", amountCents: 4900, nextPaymentDate: "2026-11-05", ...old }),
    makeSubscription({ name: "Prąd", amountCents: 18000, nextPaymentDate: "2026-11-20", amountIsEstimate: true, category: "utilities", ...old }),
    makeSubscription({ name: "Antywirus", amountCents: 19900, billingCycle: "yearly", nextPaymentDate: "2026-11-12", category: "software", ...old }),
    makeSubscription({ name: "Disney+", amountCents: 3799, nextPaymentDate: "2026-12-03", trialEndsAt: "2026-11-14", ...old }),
    makeSubscription({ name: "HBO", amountCents: 2999, status: "cancelled", cancelledAt: "2026-09-01T00:00:00Z" }),
  ];

  it("sums the month and points out rare renewals and trials", () => {
    const s = buildMonthlySummary(subs, [], "2026-11-01", new Date("2026-11-01T06:00:00Z"));
    expect(s.monthName).toBe("listopadzie");
    expect(s.paymentCount).toBe(3);
    expect(s.totalCents).toBe(4900 + 18000 + 19900);
    expect(s.estimate).toBe(true);
    expect(s.renewals.map((r) => r.name)).toEqual(["Antywirus"]);
    expect(s.trialsEnding.map((r) => r.name)).toEqual(["Disney+"]);
    expect(s.savingsYearlyCents).toBe(2999 * 12);
    expect(s.usageQuestionCount).toBe(3);
  });

  it("builds a plain e-mail with links", () => {
    const email = buildMonthlySummaryEmail(buildMonthlySummary(subs, [], "2026-11-01"), "https://www.oplacik.pl");
    expect(email.subject).toMatch(/^W listopadzie zapłacisz ok\. 428,00\szł stałych opłat$/);
    expect(email.text).toContain("Antywirus odnowi się");
    expect(email.text).toContain("https://www.oplacik.pl/panel/oszczedzaj#uzywanie");
    expect(email.html).toContain("Okres próbny Disney+");
    expect(email.text).toContain("359,88");
    expect(email.text).toContain("https://www.oplacik.pl/panel/start");
  });
});
