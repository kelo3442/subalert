import { describe, expect, it } from "vitest";
import { dueReminders, type ReminderPreferences, type ReminderSource } from "./schedule";

const preferences: ReminderPreferences = { enabled: true, daysBefore: 3, timeZone: "Europe/Warsaw" };

function source(overrides: Partial<ReminderSource> = {}): ReminderSource {
  return {
    id: "sub-1",
    userId: "user-1",
    status: "active",
    billingCycle: "monthly",
    nextPaymentDate: "2026-10-15",
    trialEndsAt: null,
    ...overrides,
  };
}

const at = (iso: string) => new Date(iso);

describe("dueReminders", () => {
  it("is not due before the reminder window", () => {
    expect(dueReminders(source(), preferences, at("2026-10-11T08:00:00Z"))).toEqual([]);
  });

  it("is due from N days before until the payment day", () => {
    for (const day of ["2026-10-12", "2026-10-14", "2026-10-15"]) {
      const result = dueReminders(source(), preferences, at(`${day}T08:00:00Z`));
      expect(result).toEqual([
        {
          subscriptionId: "sub-1",
          userId: "user-1",
          kind: "payment",
          eventDate: "2026-10-15",
          sendOn: "2026-10-12",
        },
      ]);
    }
  });

  it("produces the same key on every run so the database can deduplicate", () => {
    const first = dueReminders(source(), preferences, at("2026-10-12T06:00:00Z"));
    const second = dueReminders(source(), preferences, at("2026-10-13T06:00:00Z"));
    expect(first[0].eventDate).toBe(second[0].eventDate);
    expect(first[0].kind).toBe(second[0].kind);
  });

  it("moves to the next cycle after the payment day", () => {
    const result = dueReminders(source(), preferences, at("2026-10-16T08:00:00Z"));
    expect(result).toEqual([]);
    const later = dueReminders(source(), preferences, at("2026-11-12T08:00:00Z"));
    expect(later[0].eventDate).toBe("2026-11-15");
  });

  it("uses the user's time zone to decide the day", () => {
    // 23:30 UTC on Oct 11 is already Oct 12 in Warsaw.
    const lateUtc = at("2026-10-11T23:30:00Z");
    expect(dueReminders(source(), preferences, lateUtc)).toHaveLength(1);
    expect(dueReminders(source(), { ...preferences, timeZone: "UTC" }, lateUtc)).toEqual([]);
  });

  it("reminds about trial ends", () => {
    const result = dueReminders(
      source({ nextPaymentDate: "2026-11-20", trialEndsAt: "2026-10-14" }),
      preferences,
      at("2026-10-12T08:00:00Z"),
    );
    expect(result).toEqual([
      expect.objectContaining({ kind: "trial_end", eventDate: "2026-10-14", sendOn: "2026-10-11" }),
    ]);
  });

  it("sends a single trial reminder when the trial ends on the charge date", () => {
    const result = dueReminders(
      source({ nextPaymentDate: "2026-10-14", trialEndsAt: "2026-10-14" }),
      preferences,
      at("2026-10-12T08:00:00Z"),
    );
    expect(result.map((r) => r.kind)).toEqual(["trial_end"]);
  });

  it("skips ended trials, cancelled subscriptions and disabled reminders", () => {
    const now = at("2026-10-14T08:00:00Z");
    expect(dueReminders(source({ nextPaymentDate: "2026-12-01", trialEndsAt: "2026-10-13" }), preferences, now)).toEqual([]);
    expect(dueReminders(source({ status: "cancelled" }), preferences, now)).toEqual([]);
    expect(dueReminders(source(), { ...preferences, enabled: false }, now)).toEqual([]);
  });

  it("supports same-day reminders", () => {
    const sameDay = { ...preferences, daysBefore: 0 };
    expect(dueReminders(source(), sameDay, at("2026-10-14T08:00:00Z"))).toEqual([]);
    expect(dueReminders(source(), sameDay, at("2026-10-15T08:00:00Z"))).toHaveLength(1);
  });

  it("handles the end of the year", () => {
    const result = dueReminders(
      source({ nextPaymentDate: "2027-01-01", billingCycle: "yearly" }),
      preferences,
      at("2026-12-29T12:00:00Z"),
    );
    expect(result[0]).toMatchObject({ eventDate: "2027-01-01", sendOn: "2026-12-29" });
  });
});
