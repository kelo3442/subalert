import { z } from "zod";
import { isValidTimeZone } from "@/lib/dates";
import { MAX_REMINDER_DAYS_BEFORE } from "@/lib/reminders/schedule";
import { readString } from "./shared";

export const reminderSettingsSchema = z.object({
  remindersEnabled: z.boolean(),
  daysBefore: z.coerce
    .number("Wybierz liczbę dni.")
    .int("Wybierz liczbę dni.")
    .min(0, "Liczba dni nie może być ujemna.")
    .max(MAX_REMINDER_DAYS_BEFORE, `Maksymalnie ${MAX_REMINDER_DAYS_BEFORE} dni.`),
  timeZone: z.string().trim().refine(isValidTimeZone, "Nieznana strefa czasowa."),
});

export type ReminderSettingsField = keyof z.input<typeof reminderSettingsSchema>;

export function reminderSettingsInputFromFormData(formData: FormData) {
  return {
    remindersEnabled: formData.get("remindersEnabled") === "on",
    daysBefore: readString(formData, "daysBefore"),
    timeZone: readString(formData, "timeZone"),
  };
}
