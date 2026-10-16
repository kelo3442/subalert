import { CalendarClock, Gift, Hourglass } from "lucide-react";

const ROWS = [
  { name: "Serwis wideo", when: "za 2 dni", amount: "49,00 zł", hot: true },
  { name: "Muzyka", when: "za 9 dni", amount: "23,99 zł", hot: false },
  { name: "Chmura na pliki", when: "za 21 dni", amount: "9,99 zł", hot: false },
];

/** Illustrative UI with sample data — not real user statistics. */
export function ProductPreview() {
  return (
    <figure className="animate-fade-up [animation-delay:120ms]">
      <p className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-center text-sm font-medium text-fg">
        <Gift className="size-4 shrink-0 text-accent" aria-hidden />
        Podstawowa wersja Opłacika jest darmowa. Poniżej przykład, jak zobaczysz swoje wydatki.
      </p>
      <div className="relative rounded-3xl border border-line bg-surface/80 p-4 shadow-2xl shadow-black/40 sm:p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-subtle">Przykład: Twoje subskrypcje</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            <p className="text-xs text-muted">Wydajesz miesięcznie</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">82,98 zł</p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <p className="text-xs text-accent/80">Wydajesz rocznie</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-accent">995,76 zł</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-warn/30 bg-warn/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-warn">
            <Hourglass className="size-4" aria-hidden /> Trial Guard
          </div>
          <p className="mt-1 text-sm text-fg">Okres próbny kończy się za 3 dni</p>
          <p className="text-xs text-muted">Potem 29,99 zł miesięcznie — zdecyduj, czy zostajesz.</p>
        </div>
        <div className="mt-3 rounded-2xl border border-line bg-surface-2 p-2">
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
                <span className="tabular-nums text-fg">{row.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-subtle">Przykładowe dane. To nie są ceny Opłacika.</figcaption>
    </figure>
  );
}
