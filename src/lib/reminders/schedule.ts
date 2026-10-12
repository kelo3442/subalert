import { addDays, compareISODates, todayInTimeZone, type ISODate } from "@/lib/dates";
import { nextPaymentOnOrAfter, type BillingCycle } from "@/lib/subscriptions/billing";

export const REMINDER_KINDS = ["payment", "trial_end"] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

export const DEFAULT_REMINDER_DAYS_BEFORE = 3;
export const MAX_REMINDER_DAYS_BEFORE = 14;

export interface ReminderPreferences {
  enabled: boolean;
  daysBefore: number;
  timeZone: string;
}

export interface ReminderSource {
  id: string;
  userId: string;
  status: "active" | "cancelled";
  billingCycle: BillingCycle;
  nextPaymentDate: ISODate;
  trialEndsAt: ISODate | null;
}

export interface ReminderCandidate {
  subscriptionId: string;
  userId: string;
  kind: ReminderKind;
  /** Date of the charge or the trial end the reminder is about. */
  eventDate: ISODate;
  /** First local date on which the reminder may be sent. */
  sendOn: ISODate;
}

/** The date a reminder becomes due, given the event date and user preferences. */
export function reminderSendDate(eventDate: ISODate, daysBefore: number): ISODate {
  return addDays(eventDate, -daysBefore);
}

/**
 * Reminders that should be sent now. A reminder stays due from its send date
 * until the event itself, so a missed cron run still catches up, and the
 * (subscription, kind, eventDate) triple is what deduplicates deliveries.
 */
export function dueReminders(
  subscription: ReminderSource,
  preferences: ReminderPreferences,
  now: Date,
): ReminderCandidate[] {
  if (!preferences.enabled || subscription.status !== "active") return [];

  const today = todayInTimeZone(preferences.timeZone, now);
  const candidates: ReminderCandidate[] = [];

  const paymentDate = nextPaymentOnOrAfter(
    subscription.nextPaymentDate,
    subscription.billingCycle,
    today,
  );
  const paymentSendOn = reminderSendDate(paymentDate, preferences.daysBefore);
  const trialEnd = subscription.trialEndsAt;
  // A trial ending on the charge date gets one trial reminder, not two e-mails.
  const coveredByTrialReminder = trialEnd === paymentDate;
  if (!coveredByTrialReminder && compareISODates(today, paymentSendOn) >= 0) {
    candidates.push({
      subscriptionId: subscription.id,
      userId: subscription.userId,
      kind: "payment",
      eventDate: paymentDate,
      sendOn: paymentSendOn,
    });
  }

  if (trialEnd && compareISODates(trialEnd, today) >= 0) {
    const trialSendOn = reminderSendDate(trialEnd, preferences.daysBefore);
    if (compareISODates(today, trialSendOn) >= 0) {
      candidates.push({
        subscriptionId: subscription.id,
        userId: subscription.userId,
        kind: "trial_end",
        eventDate: trialEnd,
        sendOn: trialSendOn,
      });
    }
  }

  return candidates;
}
