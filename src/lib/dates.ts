/**
 * Calendar dates are handled as ISO strings ("YYYY-MM-DD") without a time
 * component. Arithmetic runs in UTC so that DST transitions never shift a day.
 */
export type ISODate = string;

export const DEFAULT_TIME_ZONE = "Europe/Warsaw";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function isValidISODate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function toUTCDate(iso: ISODate): Date {
  if (!isValidISODate(iso)) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUTCDate(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const date = toUTCDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUTCDate(date);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Adds months keeping the day of month when possible, otherwise clamping to
 * the last day (Jan 31 + 1 month = Feb 28/29).
 */
export function addMonthsClamped(iso: ISODate, months: number): ISODate {
  const date = toUTCDate(iso);
  const day = date.getUTCDate();
  const totalMonths = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(totalMonths / 12);
  const monthIndex = totalMonths - year * 12;
  const clampedDay = Math.min(day, daysInMonth(year, monthIndex));
  return fromUTCDate(new Date(Date.UTC(year, monthIndex, clampedDay)));
}

/**
 * The next date (today or later) falling on `dayOfMonth`, clamped to the
 * month's length — e.g. day 31 in February gives Feb 28/29.
 */
export function nextDateForDayOfMonth(today: ISODate, dayOfMonth: number): ISODate {
  const [y, m, d] = today.split("-").map(Number);
  const thisMonth = Math.min(dayOfMonth, daysInMonth(y, m - 1));
  if (thisMonth >= d) return fromUTCDate(new Date(Date.UTC(y, m - 1, thisMonth)));
  const next = new Date(Date.UTC(y, m, 1));
  const nextDay = Math.min(dayOfMonth, daysInMonth(next.getUTCFullYear(), next.getUTCMonth()));
  return fromUTCDate(new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth(), nextDay)));
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTCDate(to).getTime() - toUTCDate(from).getTime()) / MS_PER_DAY);
}

export function compareISODates(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date "today" as seen by someone living in `timeZone`. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): ISODate {
  const zone = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

const longDateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const weekdayFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  timeZone: "UTC",
});

const weekdayDayMonthFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const monthYearFormatter = new Intl.DateTimeFormat("pl-PL", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDateLong(iso: ISODate): string {
  return longDateFormatter.format(toUTCDate(iso));
}

export function formatDateShort(iso: ISODate): string {
  return shortDateFormatter.format(toUTCDate(iso));
}

/** "piątek, 16 października" */
export function formatWeekdayDayMonth(iso: ISODate): string {
  return weekdayDayMonthFormatter.format(toUTCDate(iso));
}

/** "Jutro" / "Za 5 dni" / "Dziś" — capitalised for the start of a line. */
export function formatRelativeDaysTitle(days: number): string {
  const text = formatRelativeDays(days);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatWeekday(iso: ISODate): string {
  return weekdayFormatter.format(toUTCDate(iso));
}

export function formatMonthYear(iso: ISODate): string {
  return monthYearFormatter.format(toUTCDate(iso));
}

/** "dziś", "jutro", "za 3 dni", "2 dni temu" */
export function formatRelativeDays(days: number): string {
  if (days === 0) return "dziś";
  if (days === 1) return "jutro";
  if (days === -1) return "wczoraj";
  if (days > 0) return `za ${days} ${pluralDays(days)}`;
  return `${-days} ${pluralDays(-days)} temu`;
}

export function pluralDays(count: number): string {
  return count === 1 ? "dzień" : "dni";
}
