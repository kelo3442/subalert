import { addDays, type ISODate } from "@/lib/dates";
import { formatAmount, formatPLN } from "@/lib/money";
import type { ScheduleEvent } from "@/lib/subscriptions/schedule";

/** How far ahead the calendar feed lists payments. */
export const CALENDAR_HORIZON_DAYS = 400;

/** Escapes TEXT values (RFC 5545 §3.3.11). */
export function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds a content line to at most 75 octets, never splitting a UTF-8 character (RFC 5545 §3.1). */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (currentBytes + bytes > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += bytes;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const compactDate = (date: ISODate) => date.replaceAll("-", "");

function utcStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function eventLines(event: ScheduleEvent, stamp: string, appUrl: string): string[] {
  const { subscription } = event;
  const isTrial = event.kind === "trial_end";
  const amount = formatAmount(subscription.amountCents, subscription.amountIsEstimate);
  const summary = isTrial ? `⏳ Koniec okresu próbnego: ${subscription.name}` : `💳 ${subscription.name} — ${amount}`;
  const description = isTrial
    ? `Po okresie próbnym ${subscription.name} może pobrać ${formatPLN(subscription.amountCents)}. Jeśli nie chcesz płacić, anuluj usługę u dostawcy wcześniej.`
    : `Płatność za ${subscription.name}: ${amount}.`;
  const url = `${appUrl}/panel/subskrypcje/${subscription.id}`;
  return [
    "BEGIN:VEVENT",
    `UID:${subscription.id}-${event.kind}-${event.date}@subalert`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
    `DTEND;VALUE=DATE:${compactDate(addDays(event.date, 1))}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(`${description}\n\nSzczegóły: ${url}`)}`,
    `URL:${url}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(summary)}`,
    // 9:00 the day before (all-day events start at midnight).
    "TRIGGER:-PT15H",
    "END:VALARM",
    "END:VEVENT",
  ];
}

/** An iCalendar feed of upcoming payments and trial ends, for calendar apps to subscribe to. */
export function buildCalendar(events: ScheduleEvent[], options: { appUrl: string; now?: Date }): string {
  const stamp = utcStamp(options.now ?? new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SubAlert//Kalendarz płatności//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SubAlert — płatności",
    "X-WR-CALDESC:Terminy płatności i końce okresów próbnych z SubAlert",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...events.flatMap((event) => eventLines(event, stamp, options.appUrl)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
