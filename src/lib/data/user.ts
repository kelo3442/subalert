import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { DEFAULT_TIME_ZONE } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/env";
import { DEFAULT_REMINDER_DAYS_BEFORE, type ReminderPreferences } from "@/lib/reminders/schedule";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
}

/** Verifies the session with Supabase Auth (not just the cookie contents). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    if (error && error.name !== "AuthSessionMissingError") console.warn("Session rejected by Supabase Auth:", error.message);
    return null;
  }
  return { id: data.user.id, email: data.user.email ?? "" };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  return user;
}

export interface UserProfile extends ReminderPreferences {
  email: string;
}

export const getUserProfile = cache(async (): Promise<UserProfile> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("time_zone, reminders_enabled, reminder_days_before")
    .eq("id", user.id)
    .maybeSingle();

  return {
    email: user.email,
    timeZone: data?.time_zone ?? DEFAULT_TIME_ZONE,
    enabled: data?.reminders_enabled ?? true,
    daysBefore: data?.reminder_days_before ?? DEFAULT_REMINDER_DAYS_BEFORE,
  };
});
