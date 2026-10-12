import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonthsClamped,
  daysBetween,
  formatRelativeDays,
  isValidISODate,
  todayInTimeZone,
} from "./dates";

describe("isValidISODate", () => {
  it("accepts real dates including leap days", () => {
    expect(isValidISODate("2024-02-29")).toBe(true);
    expect(isValidISODate("2026-12-31")).toBe(true);
  });

  it("rejects impossible or malformed dates", () => {
    expect(isValidISODate("2025-02-29")).toBe(false);
    expect(isValidISODate("2026-13-01")).toBe(false);
    expect(isValidISODate("2026-4-1")).toBe(false);
    expect(isValidISODate("")).toBe(false);
  });
});

describe("date arithmetic", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is unaffected by DST changes", () => {
    // Poland switches to summer time on 2026-03-29.
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
  });

  it("clamps months to the last day", () => {
    expect(addMonthsClamped("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsClamped("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonthsClamped("2026-11-30", 3)).toBe("2027-02-28");
    expect(addMonthsClamped("2026-03-31", -1)).toBe("2026-02-28");
  });

  it("counts days in both directions", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2026-01-10", "2026-01-01")).toBe(-9);
  });
});

describe("todayInTimeZone", () => {
  it("uses the user's local calendar date", () => {
    const lateEveningUtc = new Date("2026-12-31T23:30:00Z");
    expect(todayInTimeZone("Europe/Warsaw", lateEveningUtc)).toBe("2027-01-01");
    expect(todayInTimeZone("UTC", lateEveningUtc)).toBe("2026-12-31");
    expect(todayInTimeZone("America/New_York", lateEveningUtc)).toBe("2026-12-31");
  });

  it("falls back to Europe/Warsaw for unknown zones", () => {
    const now = new Date("2026-06-30T22:30:00Z");
    expect(todayInTimeZone("Not/AZone", now)).toBe("2026-07-01");
  });
});

describe("formatRelativeDays", () => {
  it("uses Polish wording", () => {
    expect(formatRelativeDays(0)).toBe("dziś");
    expect(formatRelativeDays(1)).toBe("jutro");
    expect(formatRelativeDays(5)).toBe("za 5 dni");
    expect(formatRelativeDays(-2)).toBe("2 dni temu");
  });
});
