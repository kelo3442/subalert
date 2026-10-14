import { compareISODates, daysBetween, isValidISODate, todayInTimeZone, type ISODate } from "@/lib/dates";
import { MAX_AMOUNT_CENTS } from "@/lib/money";
import { nextPaymentOnOrAfter, nthPaymentDate, type BillingCycle } from "@/lib/subscriptions/billing";
import type { CategoryKey } from "@/lib/subscriptions/categories";
import { matchServiceInDescription } from "@/lib/subscriptions/popular-services";

export interface InboundEmail {
  from: string;
  subject: string;
  text: string;
  html: string;
  receivedAt: Date;
}

/** What the e-mail is about: a charge, a trial, a cancellation or an announced price change. */
export type EmailEvent = "receipt" | "trial" | "cancellation" | "price_change";

export type ParsedEmail =
  | { kind: "gmail_verification"; code: string | null; link: string | null }
  | {
      kind: "subscription";
      event: EmailEvent;
      name: string;
      knownService: boolean;
      amountCents: number | null;
      cycle: BillingCycle;
      nextPaymentDate: ISODate | null;
      trialEndsAt: ISODate | null;
      category: CategoryKey | null;
      manageUrl: string | null;
    }
  | { kind: "ignored" };

const MAX_TEXT = 20_000;

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ");
}

/** For manually forwarded mail the real sender is quoted in the body. */
export function originalSender(from: string, text: string): string {
  const forwarded = /(?:forwarded message|wiadomość przekazana|przekazana wiadomość)[\s\S]{0,200}?(?:from|od):\s*([^\n]+)/i.exec(text);
  return forwarded ? forwarded[1].trim() : from;
}

/** "Netflix <info@account.netflix.com>" → "Netflix"; bare address → "Netflix" from the domain. */
export function senderName(from: string): string {
  const display = /^\s*"?([^"<]+?)"?\s*</.exec(from)?.[1]?.trim();
  if (display && !display.includes("@")) return display.slice(0, 80);
  const domain = /@([a-z0-9.-]+)/i.exec(from)?.[1] ?? "";
  const parts = domain.split(".").filter(Boolean);
  const base = parts.length >= 2 ? parts[parts.length - 2] : parts[0] ?? "";
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

const TOTAL_LINE = /razem|suma|łącznie|lacznie|do zapłaty|total|amount|kwota|charged|obciąż|zapłacon|cena|price|płatność|payment/i;

function toCents(whole: string, fraction: string): number | null {
  const cents = Number(whole.replace(/[\s .]/g, "")) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_AMOUNT_CENTS ? cents : null;
}

/** PLN amounts found in the text; prefers the one on a "total" line, then the largest. */
export function findPlnAmount(text: string): number | null {
  const found: { cents: number; total: boolean }[] = [];
  const patterns = [
    /(\d{1,3}(?:[  .]\d{3})+|\d+)(?:[.,](\d{2}))?\s*(?:zł|zl|pln)(?![a-z])/gi,
    /(?:pln|zł)\s*(\d{1,3}(?:[  .]\d{3})+|\d+)(?:[.,](\d{2}))?/gi,
  ];
  for (const line of text.split("\n")) {
    for (const pattern of patterns) {
      for (const match of line.matchAll(pattern)) {
        const cents = toCents(match[1], match[2] ?? "");
        if (cents) found.push({ cents, total: TOTAL_LINE.test(line) });
      }
    }
  }
  if (found.length === 0) return null;
  const pool = found.some((f) => f.total) ? found.filter((f) => f.total) : found;
  return Math.max(...pool.map((f) => f.cents));
}

export function detectCycle(text: string): BillingCycle {
  if (/półroczn|co pół roku|semi-?annual|6 miesięcy/i.test(text)) return "semiannual";
  if (/rocz|annual|yearly|per year|\/\s?rok|12 miesięcy/i.test(text)) return "yearly";
  if (/dwumiesi[eę]czn|co 2 miesiące|co dwa miesiące|bimonthly/i.test(text)) return "bimonthly";
  if (/kwartaln|quarter/i.test(text)) return "quarterly";
  if (/tygodni|weekly|per week/i.test(text)) return "weekly";
  return "monthly";
}

const PL_MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const EN_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** Earliest date in the text: 2026-10-20, 20.10.2026, 20 października 2026, October 20, 2026, 20 October 2026. */
export function findDate(text: string): ISODate | null {
  const pad = (n: number) => String(n).padStart(2, "0");
  const plMonth = (name: string) => PL_MONTHS.indexOf(name.toLowerCase()) + 1;
  const enMonth = (name: string) => EN_MONTHS.indexOf(name.toLowerCase()) + 1;
  const rules: [RegExp, (m: RegExpExecArray) => string][] = [
    [/(\d{4})-(\d{2})-(\d{2})/, (m) => `${m[1]}-${m[2]}-${m[3]}`],
    [/(\d{1,2})[./](\d{1,2})[./](\d{4})/, (m) => `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`],
    [new RegExp(`(\\d{1,2})\\s+(${PL_MONTHS.join("|")})\\s+(\\d{4})`, "i"), (m) => `${m[3]}-${pad(plMonth(m[2]))}-${pad(+m[1])}`],
    [new RegExp(`(${EN_MONTHS.join("|")})\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i"), (m) => `${m[3]}-${pad(enMonth(m[1]))}-${pad(+m[2])}`],
    [new RegExp(`(\\d{1,2})\\s+(${EN_MONTHS.join("|")})\\s+(\\d{4})`, "i"), (m) => `${m[3]}-${pad(enMonth(m[2]))}-${pad(+m[1])}`],
  ];
  const found = rules
    .map(([pattern, toIso]) => {
      const match = pattern.exec(text);
      return match ? { iso: toIso(match), index: match.index } : null;
    })
    .filter((f): f is { iso: string; index: number } => f !== null && isValidISODate(f.iso))
    .sort((a, b) => a.index - b.index);
  return found[0]?.iso ?? null;
}

const TRIAL = /okres próbn|okresu próbn|bezpłatn\w* okres|darmow\w* okres|free trial|trial/i;

export function findTrialEnd(text: string): { isTrial: boolean; endsAt: ISODate | null } {
  // Split on sentence ends only (".", "!" or "?" followed by whitespace), so "30.10.2026" stays intact.
  const sentence = text.split(/(?<=[.!?])\s+|\n/).find((part) => TRIAL.test(part));
  if (!sentence) return { isTrial: false, endsAt: null };
  return { isTrial: true, endsAt: findDate(sentence) };
}

const CANCELLATION =
  /(subskrypcj\w*|członkostw\w*|abonament\w*|plan\w*|konto premium)\s+(\S+\s+){0,3}(został[ao]?\s+)?(anulowan|zakończon|wyłączon|wygas)|anulowa\w*\s+(\S+\s+){0,2}(subskrypcj|członkostw|abonament|plan)|zrezygnowa|potwierdzenie (anulowania|rezygnacji)|(subscription|membership|plan)\s+(\S+\s+){0,3}(has been |was |is )?(cancel+ed|ended)|cancel+ation (confirmed|confirmation)|sorry to see you go/i;
const PRICE_CHANGE = /zmian\w* cen|now\w* cen|cen\w* (wzrośnie|wzrasta|zmieni|zostanie zmienion)|podwyżk|price (increase|change)|new price|price is changing|prices? (will )?(go up|increase)/i;

/** Classifies the e-mail; the subject and the opening lines matter most. */
export function detectEvent(subject: string, text: string, isTrial: boolean): EmailEvent {
  const head = `${subject}\n${text.slice(0, 800)}`;
  if (CANCELLATION.test(head)) return "cancellation";
  if (PRICE_CHANGE.test(head)) return "price_change";
  if (isTrial) return "trial";
  return "receipt";
}

const SUBSCRIPTION_HINT = /subskrypc|abonament|członkostw|subscription|membership|renew|odnowi|premium|plan |faktur|rachun|receipt|invoice|płatnoś|payment|okres próbn|trial/i;

export function parseGmailVerification(email: InboundEmail): { code: string | null; link: string | null } | null {
  if (!/forwarding-noreply@google\.com/i.test(email.from)) return null;
  const body = `${email.subject}\n${email.text || htmlToText(email.html)}`;
  const code = /\(#(\d{6,12})\)/.exec(email.subject)?.[1] ?? /(?:code|kod)[^\d]{0,30}(\d{6,12})/i.exec(body)?.[1] ?? null;
  const link = /https:\/\/mail-settings\.google\.com\/mail\/vf-[^\s"'<>]+/.exec(body)?.[0] ?? null;
  return { code, link };
}

export function parseReceiptEmail(email: InboundEmail, timeZone: string): ParsedEmail {
  const verification = parseGmailVerification(email);
  if (verification) return { kind: "gmail_verification", ...verification };

  const text = (email.text || htmlToText(email.html)).slice(0, MAX_TEXT);
  const sender = originalSender(email.from, text);
  const haystack = `${sender}\n${email.subject}\n${text}`;
  const service = matchServiceInDescription(haystack);
  if (!service && !SUBSCRIPTION_HINT.test(`${email.subject}\n${text}`)) return { kind: "ignored" };

  const name = service?.name ?? senderName(sender);
  if (!name) return { kind: "ignored" };

  const amountCents = findPlnAmount(`${email.subject}\n${text}`);
  const cycle = detectCycle(`${email.subject}\n${text}`);
  const trial = findTrialEnd(`${email.subject}\n${text}`);
  const today = todayInTimeZone(timeZone, email.receivedAt);

  let nextPaymentDate: ISODate | null = null;
  if (trial.isTrial) {
    nextPaymentDate = trial.endsAt;
  } else {
    // A receipt confirms a charge that just happened; the next one is a cycle later.
    nextPaymentDate = nextPaymentOnOrAfter(nthPaymentDate(today, cycle, 1), cycle, today);
  }

  return {
    kind: "subscription",
    event: detectEvent(email.subject, text, trial.isTrial),
    name,
    knownService: Boolean(service),
    amountCents,
    cycle,
    nextPaymentDate,
    trialEndsAt: trial.isTrial ? trial.endsAt : null,
    category: service?.category ?? null,
    manageUrl: service?.manageUrl ?? null,
  };
}

export type DetectionAction = "auto_add" | "suggest" | "duplicate";

/** Known services with a complete set of data are added straight away; the rest wait for review. */
export function decideAction(
  parsed: Extract<ParsedEmail, { kind: "subscription" }>,
  options: { autoAdd: boolean; existingNames: string[] },
): DetectionAction {
  const normalized = parsed.name.trim().toLocaleLowerCase("pl");
  if (options.existingNames.some((name) => name.trim().toLocaleLowerCase("pl") === normalized)) return "duplicate";
  if (options.autoAdd && parsed.knownService && parsed.amountCents && parsed.nextPaymentDate) return "auto_add";
  return "suggest";
}

/** The user's token from the recipient address: "<token>@…" or "…+<token>@…". */
export function extractInboundToken(recipients: string[]): string | null {
  for (const recipient of recipients) {
    const match = /(?:^|[<\s+"])([0-9a-f]{32})@|\+([0-9a-f]{32})@|^([0-9a-f]{32})$/i.exec(recipient.trim());
    const token = match?.[1] ?? match?.[2] ?? match?.[3];
    if (token) return token.toLowerCase();
  }
  return null;
}

/** A subscription the user already tracks, as far as e-mail updates are concerned. */
export interface TrackedSubscription {
  id: string;
  name: string;
  amountCents: number;
  billingCycle: BillingCycle;
  nextPaymentDate: ISODate;
  trialEndsAt: ISODate | null;
}

export interface SubscriptionUpdate {
  change: "payment" | "price" | "trial" | "cancelled";
  patch: {
    amount_cents?: number;
    next_payment_date?: ISODate;
    trial_ends_at?: ISODate;
    status?: "cancelled";
    cancelled_at?: string;
  };
  previousAmountCents: number | null;
}

/** A receipt counts as this period's charge when a payment was due within this many days. */
export const RECEIPT_WINDOW_DAYS = 10;

/** Guards against picking up an unrelated amount from the e-mail (shipping, other plans…). */
function plausiblePrice(next: number | null, current: number): next is number {
  return next !== null && next !== current && next >= current / 3 && next <= current * 3;
}

/** Days between `today` and the closest scheduled charge, before or after it (the anchor may lie on either side). */
export function daysToNearestPayment(anchor: ISODate, cycle: BillingCycle, today: ISODate): number {
  let n = 0;
  while (compareISODates(nthPaymentDate(anchor, cycle, n), today) < 0) n += 1;
  while (compareISODates(nthPaymentDate(anchor, cycle, n - 1), today) >= 0) n -= 1;
  return Math.min(daysBetween(nthPaymentDate(anchor, cycle, n - 1), today), daysBetween(today, nthPaymentDate(anchor, cycle, n)));
}

export function findTracked<T extends { name: string }>(name: string, tracked: T[]): T | null {
  const normalized = name.trim().toLocaleLowerCase("pl");
  return tracked.find((item) => item.name.trim().toLocaleLowerCase("pl") === normalized) ?? null;
}

/**
 * How an e-mail about an already tracked subscription changes it, or null when
 * it changes nothing. Receipts only move the schedule when a charge was due
 * around the date the e-mail arrived, so stray mails cannot shift it.
 */
export function planUpdate(
  parsed: Extract<ParsedEmail, { kind: "subscription" }>,
  tracked: TrackedSubscription,
  today: ISODate,
  now: Date = new Date(),
): SubscriptionUpdate | null {
  switch (parsed.event) {
    case "cancellation":
      return { change: "cancelled", patch: { status: "cancelled", cancelled_at: now.toISOString() }, previousAmountCents: null };

    case "price_change":
      return plausiblePrice(parsed.amountCents, tracked.amountCents)
        ? { change: "price", patch: { amount_cents: parsed.amountCents }, previousAmountCents: tracked.amountCents }
        : null;

    case "trial": {
      const endsAt = parsed.trialEndsAt;
      if (!endsAt || compareISODates(endsAt, today) < 0 || endsAt === tracked.trialEndsAt) return null;
      return { change: "trial", patch: { trial_ends_at: endsAt, next_payment_date: endsAt }, previousAmountCents: null };
    }

    case "receipt": {
      if (daysToNearestPayment(tracked.nextPaymentDate, tracked.billingCycle, today) > RECEIPT_WINDOW_DAYS) return null;
      const patch: SubscriptionUpdate["patch"] = {};
      // The charge happened when the receipt arrived; the next one is a cycle later (in the tracked cycle).
      const next = nthPaymentDate(today, tracked.billingCycle, 1);
      if (next !== nextPaymentOnOrAfter(tracked.nextPaymentDate, tracked.billingCycle, next)) patch.next_payment_date = next;
      const priceChanged = plausiblePrice(parsed.amountCents, tracked.amountCents);
      if (priceChanged) patch.amount_cents = parsed.amountCents!;
      // A receipt that matches what we already know changes nothing.
      if (Object.keys(patch).length === 0) return null;
      return {
        change: priceChanged ? "price" : "payment",
        patch,
        previousAmountCents: priceChanged ? tracked.amountCents : null,
      };
    }
  }
}
