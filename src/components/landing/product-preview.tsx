import { BellRing, CalendarClock, Gift, Hourglass, TrendingUp } from "lucide-react";

const ROWS = [
  { name: "Serwis wideo", when: "jutro", amount: "49,00 zł", hot: true },
  { name: "Muzyka", when: "za 9 dni", amount: "23,99 zł", hot: false },
  { name: "Prąd", when: "za 21 dni", amount: "ok. 180 zł", hot: false },
];

/**
 * Illustrative UI with sample data. It leads with what Opłacik does (reminders,
 * trial ends, price rises) rather than large totals, which read like a price.
 */
export function ProductPreview() {
  return (
    <figure className="animate-fade-up [animation-delay:120ms]">
      <div className="relative flex flex-col gap-3 rounded-3xl border border-line bg-surface/80 p-4 shadow-2xl shadow-black/40 sm:p-5">
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
            <BellRing className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-accent">Przypomnienie</p>
            <p className="mt-0.5 font-medium text-fg">Jutro płacisz za serwis wideo</p>
            <p className="text-sm text-muted">Masz czas, żeby zdecydować, czy go jeszcze chcesz.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn/[0.07] p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warn/15 text-warn">
            <Hourglass className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-warn">Kończy się darmowy okres</p>
            <p className="mt-0.5 font-medium text-fg">Za 3 dni zacznie się płatność</p>
            <p className="text-sm text-muted">Nie chcesz płacić? Zrezygnuj, zanim minie termin.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-3 text-fg">
            <TrendingUp className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Wykryta podwyżka</p>
            <p className="mt-0.5 font-medium text-fg">Muzyka podrożała o 3 zł</p>
            <p className="text-sm text-muted">Zauważyliśmy to w mailu od usługi.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-2">
          <p className="flex items-center gap-2 px-2 pb-2 pt-1 text-xs text-muted">
            <CalendarClock className="size-3.5" aria-hidden /> Nadchodzące płatności
          </p>
          <ul className="divide-y divide-line">
            {ROWS.map((row) => (
              <li key={row.name} className="flex items-center justify-between px-2 py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${row.hot ? "bg-accent" : "bg-line-strong"}`} />
                  <span className="text-fg">{row.name}</span>
                  <span className="text-xs text-subtle">{row.when}</span>
                </span>
                <span className="tabular-nums text-muted">{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
        <Gift className="size-3.5 text-accent" aria-hidden /> Przykładowy widok. Podstawowa wersja Opłacika jest darmowa.
      </figcaption>
    </figure>
  );
}
