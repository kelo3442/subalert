import { daysBetween, type ISODate } from "@/lib/dates";

export type TrialUrgency = "ended" | "critical" | "soon" | "later";

export interface TrialStatus {
  endsAt: ISODate;
  daysLeft: number;
  urgency: TrialUrgency;
}

export const TRIAL_CRITICAL_DAYS = 2;
export const TRIAL_SOON_DAYS = 7;

export function getTrialStatus(trialEndsAt: ISODate | null, today: ISODate): TrialStatus | null {
  if (!trialEndsAt) return null;
  const daysLeft = daysBetween(today, trialEndsAt);
  let urgency: TrialUrgency = "later";
  if (daysLeft < 0) urgency = "ended";
  else if (daysLeft <= TRIAL_CRITICAL_DAYS) urgency = "critical";
  else if (daysLeft <= TRIAL_SOON_DAYS) urgency = "soon";
  return { endsAt: trialEndsAt, daysLeft, urgency };
}
