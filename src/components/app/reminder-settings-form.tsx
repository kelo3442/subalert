"use client";

import { Minus, Plus } from "lucide-react";
import { useActionState, useState } from "react";
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
  const [days, setDays] = useState(daysBefore);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.message && <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>}
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" name="remindersEnabled" defaultChecked={enabled} className="mt-0.5 size-5 shrink-0 accent-[#c4f542]" />
        <span>
          <span className="block font-medium text-fg">Wysyłaj mi przypomnienia e-mailem</span>
          <span className="block text-sm text-muted">Przed każdą płatnością i przed końcem darmowego okresu.</span>
        </span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p id="daysBefore-label" className="mb-2 text-sm font-medium text-fg">
            Przypominaj mi o płatności
          </p>
          <div className="flex items-center gap-3" role="group" aria-labelledby="daysBefore-label">
            <button
              type="button"
              onClick={() => setDays((d) => Math.max(0, d - 1))}
              disabled={days <= 0}
              aria-label="Mniej dni"
              className="grid size-12 place-items-center rounded-xl border border-line bg-surface-2 text-fg transition-colors hover:border-line-strong disabled:opacity-40"
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <output id="daysBefore-value" aria-live="polite" className="min-w-[11ch] text-center text-lg font-semibold text-fg">
              {daysLabel(days)}
            </output>
            <button
              type="button"
              onClick={() => setDays((d) => Math.min(MAX_REMINDER_DAYS_BEFORE, d + 1))}
              disabled={days >= MAX_REMINDER_DAYS_BEFORE}
              aria-label="Więcej dni"
              className="grid size-12 place-items-center rounded-xl border border-line bg-surface-2 text-fg transition-colors hover:border-line-strong disabled:opacity-40"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          </div>
          <input type="hidden" id="daysBefore" name="daysBefore" value={days} />
          {errors.daysBefore && <p className="mt-1.5 text-xs text-danger">{errors.daysBefore[0]}</p>}
        </div>
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
      <SubmitButton size="lg" className="self-start" pendingText="Zapisywanie…">
        Zapisz ustawienia
      </SubmitButton>
    </form>
  );
}
