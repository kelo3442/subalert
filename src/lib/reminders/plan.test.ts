import { describe, expect, it } from "vitest";
import { planReminders, reminderKey, type PlanProfile, type PlanSubscription } from "./plan";

const profile: PlanProfile = {
  id: "u1",
  email: "jan@example.pl",
  timeZone: "Europe/Warsaw",
  remindersEnabled: true,
  daysBefore: 3,
};

const subscription: PlanSubscription = {
  id: "s1",
  userId: "u1",
  name: "Spotify",
  amountCents: 2399,
  billingCycle: "monthly",
  nextPaymentDate: "2026-10-14",
  trialEndsAt: null,
  manageUrl: null,
  status: "active",
};

const now = new Date("2026-10-12T06:00:00Z");

describe("planReminders", () => {
  it("attaches the recipient and local date", () => {
    const [reminder] = planReminders([profile], [subscription], now);
    expect(reminder).toMatchObject({ email: "jan@example.pl", today: "2026-10-12", kind: "payment" });
    expect(reminderKey(reminder)).toBe("s1:payment:2026-10-14");
  });

  it("never sends to other users or users without e-mail or with reminders off", () => {
    const stranger = { ...subscription, id: "s2", userId: "u2" };
    expect(planReminders([profile], [stranger], now)).toEqual([]);
    expect(planReminders([{ ...profile, email: null }], [subscription], now)).toEqual([]);
    expect(planReminders([{ ...profile, remindersEnabled: false }], [subscription], now)).toEqual([]);
  });

  it("respects each user's own settings", () => {
    const early = { ...profile, id: "u2", daysBefore: 1 };
    const result = planReminders(
      [profile, early],
      [subscription, { ...subscription, id: "s2", userId: "u2" }],
      now,
    );
    expect(result.map((r) => r.subscriptionId)).toEqual(["s1"]);
  });
});
