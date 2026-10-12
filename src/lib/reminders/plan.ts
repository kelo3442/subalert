import { todayInTimeZone, type ISODate } from "@/lib/dates";
import type { BillingCycle } from "@/lib/subscriptions/billing";
import { dueReminders, type ReminderCandidate } from "./schedule";

export interface PlanProfile {
  id: string;
  email: string | null;
  timeZone: string;
  remindersEnabled: boolean;
  daysBefore: number;
}

export interface PlanSubscription {
  id: string;
  userId: string;
  name: string;
  amountCents: number;
  billingCycle: BillingCycle;
  nextPaymentDate: ISODate;
  trialEndsAt: ISODate | null;
  manageUrl: string | null;
  status: "active" | "cancelled";
}

export interface PlannedReminder extends ReminderCandidate {
  email: string;
  today: ISODate;
  subscription: PlanSubscription;
}

export function reminderKey(r: { subscriptionId: string; kind: string; eventDate: string }): string {
  return `${r.subscriptionId}:${r.kind}:${r.eventDate}`;
}

/** Joins users with their subscriptions and returns every reminder due now. */
export function planReminders(
  profiles: PlanProfile[],
  subscriptions: PlanSubscription[],
  now: Date,
): PlannedReminder[] {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const planned: PlannedReminder[] = [];

  for (const subscription of subscriptions) {
    const profile = profilesById.get(subscription.userId);
    if (!profile || !profile.email) continue;
    const preferences = {
      enabled: profile.remindersEnabled,
      daysBefore: profile.daysBefore,
      timeZone: profile.timeZone,
    };
    for (const candidate of dueReminders(subscription, preferences, now)) {
      planned.push({
        ...candidate,
        email: profile.email,
        today: todayInTimeZone(profile.timeZone, now),
        subscription,
      });
    }
  }
  return planned;
}
