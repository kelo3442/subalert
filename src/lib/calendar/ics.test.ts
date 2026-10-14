import { describe, expect, it } from "vitest";
import { makeSubscription } from "@/lib/subscriptions/fixtures";
import { upcomingEvents } from "@/lib/subscriptions/schedule";
import { buildCalendar, escapeText, foldLine } from "./ics";

const unfold = (ics: string) => ics.replace(/\r\n /g, "").replace(/\u00a0/g, " ");

describe("iCalendar feed", () => {
  it("escapes text values", () => {
    expect(escapeText("A, B; C\\D\nE")).toBe("A\\, B\\; C\\\\D\\nE");
  });

  it("folds long lines at 75 octets without splitting UTF-8 characters", () => {
    const line = `SUMMARY:${"ż".repeat(60)}`;
    const folded = foldLine(line);
    const encoder = new TextEncoder();
    for (const part of folded.split("\r\n")) expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(line);
    expect(foldLine("SHORT:1")).toBe("SHORT:1");
  });

  it("lists payments and trial ends as all-day events with stable IDs", () => {
    const netflix = makeSubscription({ id: "11111111-1111-4111-8111-111111111111", name: "Netflix, Standard", nextPaymentDate: "2026-10-20" });
    const spotify = makeSubscription({
      id: "22222222-2222-4222-8222-222222222222",
      name: "Spotify",
      amountCents: 2399,
      nextPaymentDate: "2026-10-16",
      trialEndsAt: "2026-10-16",
    });
    const events = upcomingEvents([netflix, spotify], "2026-10-14", 40);
    const ics = buildCalendar(events, { appUrl: "https://www.subalert.pl", now: new Date("2026-10-14T12:00:00Z") });
    const text = unfold(ics);

    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(text).toContain("UID:11111111-1111-4111-8111-111111111111-payment-2026-10-20@subalert");
    expect(text).toContain("UID:11111111-1111-4111-8111-111111111111-payment-2026-11-20@subalert");
    expect(text).toContain("DTSTART;VALUE=DATE:20261020\r\nDTEND;VALUE=DATE:20261021");
    expect(text).toContain("SUMMARY:💳 Netflix\\, Standard — 49\\,00 zł");
    expect(text).toContain("SUMMARY:⏳ Koniec okresu próbnego: Spotify");
    expect(text).toContain("DTSTAMP:20261014T120000Z");
    expect(text).toContain("URL:https://www.subalert.pl/panel/subskrypcje/22222222-2222-4222-8222-222222222222");
    expect(text.match(/BEGIN:VEVENT/g)?.length).toBe(events.length);
  });

  it("produces a valid empty calendar", () => {
    const ics = buildCalendar([], { appUrl: "https://x.pl" });
    expect(ics).toContain("X-WR-CALNAME:SubAlert — płatności");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
