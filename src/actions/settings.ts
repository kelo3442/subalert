"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  reminderSettingsInputFromFormData,
  reminderSettingsSchema,
  type ReminderSettingsField,
} from "@/lib/validation/settings";
import type { FormState } from "./form-state";

export async function updateReminderSettings(
  _prev: FormState<ReminderSettingsField>,
  formData: FormData,
): Promise<FormState<ReminderSettingsField>> {
  const user = await requireUser();
  const parsed = reminderSettingsSchema.safeParse(reminderSettingsInputFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Popraw zaznaczone pola.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      reminders_enabled: parsed.data.remindersEnabled,
      reminder_days_before: parsed.data.daysBefore,
      time_zone: parsed.data.timeZone,
    })
    .eq("id", user.id);

  if (error) return { status: "error", message: "Nie udało się zapisać ustawień. Spróbuj ponownie." };

  revalidatePath("/panel", "layout");
  return { status: "success", message: "Ustawienia zapisane." };
}

/** Invalidates the calendar feed link (e.g. if it was shared by mistake). */
export async function rotateCalendarLink(): Promise<void> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("rotate_calendar_token");
  revalidatePath("/panel/ustawienia");
}
