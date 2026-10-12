import { CalendarDays, Calculator, Hourglass, ListChecks, LogOut, Mail } from "lucide-react";

const FEATURES = [
  {
    icon: ListChecks,
    title: "Wszystkie subskrypcje w jednym miejscu",
    text: "Dodaj usługę w kilka sekund — wybierz z listy popularnych lub wpisz własną. Bez dostępu do banku i skrzynki.",
  },
  {
    icon: Calculator,
    title: "Prawdziwy koszt w skali roku",
    text: "Płatności tygodniowe, miesięczne, kwartalne i roczne przeliczamy na wspólny mianownik.",
  },
  {
    icon: Hourglass,
    title: "Trial Guard",
    text: "Zaznacz darmowy okres próbny, a SubAlert pokaże, ile dni zostało, zanim zacznie się płatność.",
  },
  {
    icon: CalendarDays,
    title: "Kalendarz płatności",
    text: "Kolejne terminy wyliczane poprawnie także na przełomie miesięcy i lat — np. płatność 31. dnia.",
  },
  {
    icon: Mail,
    title: "Przypomnienia e-mail",
    text: "Wiadomość kilka dni przed obciążeniem lub końcem okresu próbnego. Ty ustalasz, ile dni wcześniej.",
  },
  {
    icon: LogOut,
    title: "Cancel Assistant",
    text: "Link do strony zarządzania usługą, wskazówki anulowania i oznaczenie, że zrezygnowałeś.",
  },
];

export function Features() {
  return (
    <section id="funkcje" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent">Funkcje</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Mniej niespodzianek na wyciągu z konta
          </h2>
          <p className="mt-3 text-muted">
            SubAlert nie zgaduje, za co płacisz — to Ty dodajesz swoje subskrypcje. W zamian dostajesz porządek,
            liczby i przypomnienia na czas.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="group rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-strong hover:bg-surface-2"
            >
              <div className="grid size-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition-transform duration-200 group-hover:-translate-y-0.5">
                <Icon className="size-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-fg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
