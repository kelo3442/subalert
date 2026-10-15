import { BellRing, CalendarDays, Hourglass, MailCheck } from "lucide-react";
import { DemoVideo } from "./demo-video";

const POINTS = [
  { icon: BellRing, title: "Przypomnienie przed płatnością", text: "E-mail albo powiadomienie na telefonie, zanim pieniądze zejdą z konta." },
  { icon: Hourglass, title: "Koniec okresu próbnego", text: "Widzisz, ile dni zostało, zanim darmowy okres zamieni się w płatność." },
  { icon: MailCheck, title: "Podwyżki z e-maili", text: "Przekazany mail o nowej cenie aktualizuje kwotę i pokazuje, co podrożało." },
  { icon: CalendarDays, title: "Kalendarz płatności", text: "Wszystkie terminy w jednym widoku — także w kalendarzu w telefonie." },
];

export function DemoSection() {
  return (
    <section id="jak-dziala" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div>
          <p className="text-sm font-medium text-accent">Jak to działa</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Zobacz Opłacik w 20 sekund</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:block sm:p-5">
                <Icon className="size-6 shrink-0 text-accent" aria-hidden />
                <div>
                  <h3 className="font-semibold text-fg sm:mt-3">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DemoVideo />
      </div>
    </section>
  );
}
