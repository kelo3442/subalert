import { X } from "lucide-react";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { cn } from "@/components/ui/cn";
import { Input, Select } from "@/components/ui/field";
import { BILLING_CYCLE_LABELS, BILLING_CYCLES, type BillingCycle } from "@/lib/subscriptions/billing";
import type { SubscriptionField } from "@/lib/validation/subscription";
import type { QuickStartEntry } from "./types";

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

export function QuickStartItem({
  entry,
  errors,
  onChange,
  onRemove,
}: {
  entry: QuickStartEntry;
  errors?: Partial<Record<SubscriptionField, string>>;
  onChange: (patch: Partial<QuickStartEntry>) => void;
  onRemove: () => void;
}) {
  const id = `qs-${entry.key}`;
  const dateError = errors?.nextPaymentDate
    ? entry.cycle === "monthly" && !entry.day
      ? "Wybierz dzień płatności."
      : errors.nextPaymentDate
    : undefined;

  return (
    <li className={cn("rounded-2xl border bg-surface p-4", errors ? "border-danger/40" : "border-line")}>
      <div className="flex items-center gap-3">
        <ServiceAvatar name={entry.name || "?"} className="size-9" />
        {entry.custom ? (
          <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-name`} className="sr-only">
              Nazwa usługi
            </label>
            <Input
              id={`${id}-name`}
              value={entry.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Nazwa usługi"
              maxLength={80}
              invalid={Boolean(errors?.name)}
              autoFocus
            />
          </div>
        ) : (
          <p className="min-w-0 flex-1 truncate font-medium text-fg">{entry.name}</p>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Usuń ${entry.name || "pozycję"}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {errors?.name && <p className="mt-1.5 text-xs text-danger">{errors.name}</p>}

      <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-line bg-bg p-1" role="radiogroup" aria-label="Cykl płatności">
        {BILLING_CYCLES.map((cycle: BillingCycle) => (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={entry.cycle === cycle}
            onClick={() => onChange({ cycle })}
            className={cn(
              "rounded-lg py-1.5 text-xs font-medium transition-colors sm:text-sm",
              entry.cycle === cycle ? "bg-surface-3 text-accent" : "text-muted hover:text-fg",
            )}
          >
            {BILLING_CYCLE_LABELS[cycle]}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-amount`} className="mb-1 block text-xs text-muted">
            Kwota
          </label>
          <div className="relative">
            <Input
              id={`${id}-amount`}
              inputMode="decimal"
              value={entry.amount}
              onChange={(e) => onChange({ amount: e.target.value })}
              placeholder="0,00"
              className="pr-9 tabular-nums"
              invalid={Boolean(errors?.amount)}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-subtle">zł</span>
          </div>
        </div>
        <div>
          {entry.cycle === "monthly" ? (
            <>
              <label htmlFor={`${id}-day`} className="mb-1 block text-xs text-muted">
                Dzień płatności
              </label>
              <Select id={`${id}-day`} value={entry.day} onChange={(e) => onChange({ day: e.target.value })} invalid={Boolean(dateError)}>
                <option value="">wybierz</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}. dnia
                  </option>
                ))}
              </Select>
            </>
          ) : (
            <>
              <label htmlFor={`${id}-date`} className="mb-1 block text-xs text-muted">
                Następna płatność
              </label>
              <Input id={`${id}-date`} type="date" value={entry.date} onChange={(e) => onChange({ date: e.target.value })} invalid={Boolean(dateError)} />
            </>
          )}
        </div>
      </div>
      {(errors?.amount || dateError) && (
        <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs text-danger" role="alert">
          <p>{errors?.amount}</p>
          <p>{dateError}</p>
        </div>
      )}
    </li>
  );
}
