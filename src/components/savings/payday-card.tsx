import { Wallet } from "lucide-react";
import { setPayday } from "@/actions/savings";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateShort, formatWeekdayDayMonth, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { paymentsUntilPayday } from "@/lib/savings/payday";
import type { Subscription } from "@/lib/subscriptions/types";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const SHOWN = 5;

function PaydayForm({ payday, compact = false }: { payday: number | null; compact?: boolean }) {
  return (
    <form action={setPayday} className="flex items-end gap-2">
      <div className={compact ? "w-36" : "w-44"}>
        <label htmlFor="payday" className="mb-1.5 block text-sm text-muted">
          Wypłata przychodzi
        </label>
        <Select id="payday" name="payday" defaultValue={payday ?? ""}>
          <option value="">wybierz dzień</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}. dnia miesiąca
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton variant="secondary">{payday ? "Zmień" : "Zapisz"}</SubmitButton>
    </form>
  );
}

/** "Do wypłaty zostanie": fixed payments due before the next payday. */
export function PaydayCard({
  subscriptions,
  today,
  payday,
  ready,
}: {
  subscriptions: Subscription[];
  today: ISODate;
  payday: number | null;
  /** False until the savings migration has run: nothing to save the day in. */
  ready: boolean;
}) {
  if (!ready) return null;
  if (payday === null) {
    return (
      <Card className="p-5" data-testid="payday-card">
        <div className="flex items-start gap-3">
          <Wallet className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-fg">Ile zejdzie do wypłaty?</h2>
            <p className="mt-1 text-sm text-muted">Podaj dzień wypłaty, a policzymy, ile stałych opłat zejdzie z konta do tego czasu.</p>
            <div className="mt-3">
              <PaydayForm payday={null} />
            </div>
          </div>
        </div>
      </Card>
    );
  }
  const until = paymentsUntilPayday(subscriptions, today, payday);
  return (
    <Card className="p-5" data-testid="payday-card">
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">Do wypłaty ({formatWeekdayDayMonth(until.payday)}) zejdzie jeszcze</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-fg">
            {until.estimate ? "ok. " : ""}
            {formatPLN(until.totalCents)}
          </p>
          {until.payments.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Do wypłaty nie ma już żadnych stałych opłat.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {until.payments.slice(0, SHOWN).map((p, i) => (
                <li key={`${p.name}-${p.date}-${i}`} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted">
                    {formatDateShort(p.date)} · {p.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-fg">{formatPLN(p.amountCents)}</span>
                </li>
              ))}
              {until.payments.length > SHOWN && <li className="text-subtle">i jeszcze {until.payments.length - SHOWN}…</li>}
            </ul>
          )}
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-subtle hover:text-muted">Zmień dzień wypłaty</summary>
            <div className="mt-2">
              <PaydayForm payday={payday} compact />
            </div>
          </details>
        </div>
      </div>
    </Card>
  );
}
