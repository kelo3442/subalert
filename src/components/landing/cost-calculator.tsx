"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { formatPLN, parseAmountToCents } from "@/lib/money";
import { BILLING_CYCLE_LABELS, BILLING_CYCLES, totalCosts, type BillingCycle } from "@/lib/subscriptions/billing";

interface Row {
  key: number;
  name: string;
  amount: string;
  cycle: BillingCycle;
}

const MAX_ROWS = 15;

export function CostCalculator() {
  const baseId = useId();
  const [rows, setRows] = useState<Row[]>([
    { key: 1, name: "", amount: "", cycle: "monthly" },
    { key: 2, name: "", amount: "", cycle: "monthly" },
    { key: 3, name: "", amount: "", cycle: "yearly" },
  ]);
  const [nextKey, setNextKey] = useState(4);

  const parsed = rows.map((row) => ({ row, cents: row.amount.trim() ? parseAmountToCents(row.amount) : 0 }));
  const valid = parsed.filter((p): p is { row: Row; cents: number } => p.cents !== null && p.cents > 0);
  const totals = totalCosts(valid.map(({ row, cents }) => ({ amountCents: cents, billingCycle: row.cycle })));

  const update = (key: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, { key: nextKey, name: "", amount: "", cycle: "monthly" }]);
    setNextKey((k) => k + 1);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="hidden grid-cols-[1fr_8rem_9rem_2.75rem] gap-2 px-1 pb-2 text-xs text-subtle sm:grid">
          <span>Usługa</span>
          <span>Kwota (zł)</span>
          <span>Cykl</span>
          <span className="sr-only">Usuń</span>
        </div>
        <ul className="flex flex-col gap-3 sm:gap-2">
          {parsed.map(({ row, cents }, index) => {
            const invalid = cents === null;
            const id = `${baseId}-${row.key}`;
            return (
              <li
                key={row.key}
                className="grid grid-cols-[1fr_2.75rem] gap-2 rounded-xl border border-line/60 p-2 sm:grid-cols-[1fr_8rem_9rem_2.75rem] sm:border-0 sm:p-0"
              >
                <label htmlFor={`${id}-name`} className="sr-only">
                  Nazwa usługi {index + 1}
                </label>
                <Input
                  id={`${id}-name`}
                  placeholder={`Subskrypcja ${index + 1}`}
                  value={row.name}
                  maxLength={80}
                  onChange={(e) => update(row.key, { name: e.target.value })}
                  className="col-span-1"
                />
                <Button
                  variant="ghost"
                  size="md"
                  className="w-11 px-0 sm:order-last"
                  onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                  aria-label={`Usuń wiersz ${index + 1}`}
                  disabled={rows.length === 1}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
                <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:contents">
                  <div>
                    <label htmlFor={`${id}-amount`} className="sr-only">
                      Kwota {index + 1}
                    </label>
                    <Input
                      id={`${id}-amount`}
                      inputMode="decimal"
                      placeholder="np. 49,99"
                      value={row.amount}
                      invalid={invalid}
                      onChange={(e) => update(row.key, { amount: e.target.value })}
                      className="tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${id}-cycle`} className="sr-only">
                      Cykl płatności {index + 1}
                    </label>
                    <Select
                      id={`${id}-cycle`}
                      value={row.cycle}
                      onChange={(e) => update(row.key, { cycle: e.target.value as BillingCycle })}
                    >
                      {BILLING_CYCLES.map((cycle) => (
                        <option key={cycle} value={cycle}>
                          {BILLING_CYCLE_LABELS[cycle]}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {parsed.some((p) => p.cents === null) && (
          <p className="mt-3 text-xs text-danger" role="alert">
            Wpisz kwotę w formacie np. 49,99 — błędne wiersze nie są liczone.
          </p>
        )}
        <Button variant="secondary" size="sm" className="mt-4" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
          <Plus className="size-4" aria-hidden /> Dodaj kolejną
        </Button>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.12] to-surface p-6" aria-live="polite">
        <div>
          <p className="text-sm text-muted">Miesięcznie płacisz średnio</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-fg">{formatPLN(totals.monthlyCents)}</p>
          <div className="my-6 h-px bg-line" />
          <p className="text-sm text-muted">W skali roku to</p>
          <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-accent">{formatPLN(totals.yearlyCents)}</p>
          <p className="mt-2 text-sm text-muted">
            {valid.length === 0
              ? "Wpisz kwoty, a wynik pojawi się od razu."
              : `Liczba subskrypcji w wyliczeniu: ${valid.length}.`}
          </p>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-subtle">
          Płatność tygodniową liczymy jako 52 obciążenia w roku, kwartalną jako 4. Kalkulator działa w Twojej
          przeglądarce — nic nie zapisujemy.
        </p>
      </div>
    </div>
  );
}
