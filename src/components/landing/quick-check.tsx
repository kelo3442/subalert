"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ServiceTile } from "@/components/onboarding/service-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { RecurringCandidate } from "@/lib/import/recurring";
import { formatPLN, parseAmountToCents } from "@/lib/money";
import { totalCosts } from "@/lib/subscriptions/billing";
import { BILL_CATEGORIES } from "@/lib/subscriptions/categories";
import { POPULAR_SERVICES } from "@/lib/subscriptions/popular-services";

// Subscriptions people forget about; rent, energy and phone bills are left out on purpose.
const SERVICES = POPULAR_SERVICES.filter((s) => !BILL_CATEGORIES.includes(s.category));

/** "Nie masz pliku?": tap the services you pay for, type the amounts, see the yearly total. */
export function QuickCheck({ onSave }: { onSave: (items: RecurringCandidate[]) => void }) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const valid = SERVICES.filter((s) => s.name in amounts).flatMap((s) => {
    const cents = parseAmountToCents(amounts[s.name] ?? "");
    return cents && cents > 0 ? [{ service: s, cents }] : [];
  });
  const totals = totalCosts(valid.map((v) => ({ amountCents: v.cents, billingCycle: "monthly" as const })));

  const toggle = (name: string) =>
    setAmounts((current) => {
      const next = { ...current };
      if (name in next) delete next[name];
      else next[name] = "";
      return next;
    });

  const save = () =>
    onSave(
      valid.map(({ service, cents }) => ({
        key: `quick-${service.name}`,
        name: service.name,
        category: service.category,
        manageUrl: service.manageUrl,
        knownService: true,
        amountCents: cents,
        cycle: "monthly",
        occurrences: 0,
        lastDate: "",
        // Unknown: the quick start asks for the payment day.
        nextPaymentDate: "",
        possiblyInactive: false,
        singleCharge: false,
      })),
    );

  return (
    <div className="flex flex-col gap-5" data-testid="quick-check">
      <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const selected = s.name in amounts;
          return (
            <li key={s.name} className={selected ? "rounded-2xl bg-accent/[0.05]" : undefined}>
              <ServiceTile name={s.name} selected={selected} alreadyAdded={false} onToggle={() => toggle(s.name)} />
              {selected && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <label htmlFor={`qc-${s.name}`} className="flex-1 text-sm text-muted">
                    Ile miesięcznie?
                  </label>
                  <div className="relative w-32">
                    <Input
                      id={`qc-${s.name}`}
                      inputMode="decimal"
                      placeholder="np. 29,99"
                      autoFocus
                      value={amounts[s.name]}
                      onChange={(e) => setAmounts((current) => ({ ...current, [s.name]: e.target.value }))}
                      className="pr-9 tabular-nums"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-subtle">zł</span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-bg/90 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <p className="text-sm text-muted">
          {valid.length === 0 ? (
            "Zaznacz usługi i wpisz kwoty."
          ) : (
            <>
              <span className="font-medium tabular-nums text-fg">{formatPLN(totals.monthlyCents)}</span>/mies. ·{" "}
              <span className="text-base font-semibold tabular-nums text-accent">{formatPLN(totals.yearlyCents)} rocznie</span>
            </>
          )}
        </p>
        <Button onClick={save} disabled={valid.length === 0}>
          Zapisz i dostawaj przypomnienia <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
