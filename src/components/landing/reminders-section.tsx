import { BellRing, CalendarPlus, Calculator, Info } from "lucide-react";

const STEPS = [
  {
    icon: CalendarPlus,
    title: "Dodajesz subskrypcję",
    text: "Podajesz kwotę, cykl i datę najbliższej płatności. Opcjonalnie: koniec okresu próbnego.",
  },
  {
    icon: Calculator,
    title: "SubAlert wylicza terminy",
    text: "Każdy kolejny termin liczymy w Twojej strefie czasowej, z poprawną obsługą krótszych miesięcy i lat przestępnych.",
  },
  {
    icon: BellRing,
    title: "Dostajesz e-mail na czas",
    text: "Kilka dni przed płatnością lub końcem okresu próbnego — liczbę dni ustawiasz sam. Każde przypomnienie wysyłamy tylko raz.",
  },
];

export function RemindersSection({ emailEnabled }: { emailEnabled: boolean }) {
  return (
    <section id="przypomnienia" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent">Przypomnienia</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Jak działają przypomnienia</h2>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative rounded-2xl border border-line bg-surface p-6">
              <span className="absolute right-5 top-5 font-mono text-xs text-subtle">0{index + 1}</span>
              <Icon className="size-6 text-accent" aria-hidden />
              <h3 className="mt-4 font-semibold text-fg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <p>
            <strong className="font-medium text-fg">Przypomnienie nie anuluje subskrypcji.</strong> SubAlert nie ma
            dostępu do Twoich kont u dostawców — jeśli chcesz zrezygnować, zrób to na stronie usługi. Pomożemy znaleźć
            właściwe miejsce.
            {!emailEnabled && " Wysyłka e-maili na tej instancji SubAlert nie jest jeszcze włączona."}
          </p>
        </div>
      </div>
    </section>
  );
}
