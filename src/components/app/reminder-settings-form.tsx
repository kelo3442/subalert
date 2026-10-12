"use client";

import { useActionState } from "react";
import { updateReminderSettings } from "@/actions/settings";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { Field, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { MAX_REMINDER_DAYS_BEFORE } from "@/lib/reminders/schedule";
import type { ReminderSettingsField } from "@/lib/validation/settings";

const initialState: FormState<ReminderSettingsField> = { status: "idle" };

function daysLabel(days: number) {
  if (days === 0) return "W dniu płatności";
  if (days === 1) return "1 dzień wcześniej";
  return `${days} dni wcześniej`;
}

export function ReminderSettingsForm({
  enabled,
  daysBefore,
  timeZone,
  timeZones,
}: {
  enabled: boolean;
  daysBefore: number;
  timeZone: string;
  timeZones: string[];
}) {
  const [state, action] = useActionState(updateReminderSettings, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message && <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>}
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" name="remindersEnabled" defaultChecked={enabled} className="mt-0.5 size-5 shrink-0 accent-[#c4f542]" />
        <span>
          <span className="block font-medium text-fg">Wysyłaj przypomnienia e-mail</span>
          <span className="block text-sm text-muted">Przed płatnością i przed końcem okresu próbnego. Każde przypomnienie tylko raz.</span>
        </span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="daysBefore" label="Kiedy przypominać" errors={errors.daysBefore}>
          <Select id="daysBefore" name="daysBefore" defaultValue={String(daysBefore)}>
            {Array.from({ length: MAX_REMINDER_DAYS_BEFORE + 1 }, (_, days) => (
              <option key={days} value={days}>
                {daysLabel(days)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="timeZone" label="Strefa czasowa" errors={errors.timeZone} hint="Decyduje, kiedy zaczyna się „dziś”.">
          <Select id="timeZone" name="timeZone" defaultValue={timeZone}>
            {timeZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <SubmitButton className="self-start" pendingText="Zapisywanie…">
        Zapisz ustawienia
      </SubmitButton>
    </form>
  );
}
