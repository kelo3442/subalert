import { PiggyBank } from "lucide-react";
import { formatDateShort, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import type { SavingsSummary } from "@/lib/savings/savings";

/** "Zaoszczędziłeś już…": money kept thanks to plans the user cancelled. */
export function SavingsCounter({ savings }: { savings: SavingsSummary }) {
  if (savings.items.length === 0) {
    return (
      <section className="rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.10] to-surface p-5 sm:p-6" data-testid="savings-counter">
        <div className="flex items-start gap-3">
          <PiggyBank className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold text-fg">Tu zobaczysz, ile oszczędzasz</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Gdy zrezygnujesz z jakiejś usługi, oznacz ją jako anulowaną. Opłacik policzy, ile zostaje Ci w kieszeni co roku i ile
              już zaoszczędziłeś.
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.12] to-surface p-5 sm:p-6" data-testid="savings-counter">
      <p className="flex items-center gap-2 text-sm text-muted">
        <PiggyBank className="size-4 text-accent" aria-hidden /> Dzięki rezygnacjom oszczędzasz
      </p>
      <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-accent sm:text-5xl">
        {formatPLN(savings.yearlyCents)} <span className="text-base font-medium text-muted">rocznie</span>
      </p>
      <p className="mt-2 text-sm text-muted">
        Od rezygnacji zostało już w kieszeni <strong className="tabular-nums text-fg">{formatPLN(savings.savedSoFarCents)}</strong>.
      </p>
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {savings.items.map(({ subscription, yearlyCents }) => (
          <li key={subscription.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium text-fg">{subscription.name}</span>
              <span className="text-xs text-muted">
                anulowane {formatDateShort(subscription.cancelledAt!.slice(0, 10) as ISODate)}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted">{formatPLN(yearlyCents)}/rok</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
