import { describe, expect, it } from "vitest";
import { makeSubscription } from "./fixtures";
import { activeTrials, categoryBreakdown, scheduleBetween, summarize, upcomingEvents } from "./schedule";
import { getTrialStatus } from "./trials";

const today = "2026-10-12";

describe("summarize", () => {
  it("computes totals from active subscriptions only", () => {
    const summary = summarize(
      [
        makeSubscription({ name: "Netflix", amountCents: 4900, nextPaymentDate: "2026-10-20" }),
        makeSubscription({ name: "Spotify", amountCents: 2399, nextPaymentDate: "2026-10-14" }),
        makeSubscription({ name: "Domena", amountCents: 12_000, billingCycle: "yearly", nextPaymentDate: "2027-03-01" }),
        makeSubscription({ name: "Stara", amountCents: 9999, status: "cancelled" }),
      ],
      today,
    );
    expect(summary.activeCount).toBe(3);
    expect(summary.cancelledCount).toBe(1);
    expect(summary.yearlyCents).toBe(4900 * 12 + 2399 * 12 + 12_000);
    expect(summary.monthlyCents).toBe(Math.round((4900 * 12 + 2399 * 12 + 12_000) / 12));
    expect(summary.nextPayment?.subscription.name).toBe("Spotify");
    expect(summary.nextPayment?.daysUntil).toBe(2);
    expect(summary.next30DaysCents).toBe(4900 + 2399);
  });

  it("rolls stale dates forward for the next payment", () => {
    const summary = summarize([makeSubscription({ nextPaymentDate: "2026-08-05" })], today);
    expect(summary.nextPayment?.date).toBe("2026-11-05");
  });

  it("handles an empty account", () => {
    expect(summarize([], today)).toMatchObject({ monthlyCents: 0, activeCount: 0, nextPayment: null });
  });
});

describe("schedule", () => {
  it("lists payments and trial ends sorted by date", () => {
    const events = scheduleBetween(
      [
        makeSubscription({ name: "Tygodniowa", billingCycle: "weekly", nextPaymentDate: "2026-10-13" }),
        makeSubscription({ name: "Próbna", nextPaymentDate: "2026-10-18", trialEndsAt: "2026-10-17" }),
        makeSubscription({ name: "Anulowana", status: "cancelled", nextPaymentDate: "2026-10-13" }),
      ],
      today,
      today,
      "2026-10-27",
    );
    expect(events.map((e) => `${e.date} ${e.kind} ${e.subscription.name}`)).toEqual([
      "2026-10-13 payment Tygodniowa",
      "2026-10-17 trial_end Próbna",
      "2026-10-18 payment Próbna",
      "2026-10-20 payment Tygodniowa",
      "2026-10-27 payment Tygodniowa",
    ]);
    expect(events[0].daysUntil).toBe(1);
  });

  it("limits the horizon", () => {
    const events = upcomingEvents([makeSubscription({ nextPaymentDate: "2026-10-12" })], today, 31);
    expect(events.map((e) => e.date)).toEqual(["2026-10-12", "2026-11-12"]);
  });
});

describe("categoryBreakdown", () => {
  it("groups monthly costs and shares", () => {
    const shares = categoryBreakdown([
      makeSubscription({ category: "video", amountCents: 3000 }),
      makeSubscription({ category: "video", amountCents: 3000 }),
      makeSubscription({ category: null, amountCents: 12_000, billingCycle: "yearly" }),
      makeSubscription({ category: "music", amountCents: 1000, status: "cancelled" }),
    ]);
    expect(shares).toEqual([
      { category: "video", monthlyCents: 6000, count: 2, share: 6000 / 7000 },
      { category: "other", monthlyCents: 1000, count: 1, share: 1000 / 7000 },
    ]);
  });
});

describe("trials", () => {
  it("classifies urgency by days left", () => {
    expect(getTrialStatus(null, today)).toBeNull();
    expect(getTrialStatus("2026-10-12", today)).toMatchObject({ daysLeft: 0, urgency: "critical" });
    expect(getTrialStatus("2026-10-14", today)).toMatchObject({ daysLeft: 2, urgency: "critical" });
    expect(getTrialStatus("2026-10-19", today)).toMatchObject({ daysLeft: 7, urgency: "soon" });
    expect(getTrialStatus("2026-11-30", today)).toMatchObject({ daysLeft: 49, urgency: "later" });
    expect(getTrialStatus("2026-10-10", today)).toMatchObject({ daysLeft: -2, urgency: "ended" });
  });

  it("lists only running trials of active subscriptions", () => {
    const trials = activeTrials(
      [
        makeSubscription({ name: "B", trialEndsAt: "2026-10-30" }),
        makeSubscription({ name: "A", trialEndsAt: "2026-10-13" }),
        makeSubscription({ name: "Ended", trialEndsAt: "2026-10-01" }),
        makeSubscription({ name: "Cancelled", trialEndsAt: "2026-10-15", status: "cancelled" }),
        makeSubscription({ name: "None" }),
      ],
      today,
    );
    expect(trials.map((s) => s.name)).toEqual(["A", "B"]);
  });
});
