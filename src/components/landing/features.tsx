import { CalendarDays, Calculator, FileSearch, Hourglass, ListChecks, LogOut, Mail, MailPlus, Receipt } from "lucide-react";

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
    text: "Zaznacz darmowy okres próbny, a Opłacik pokaże, ile dni zostało, zanim zacznie się płatność.",
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
  {
    icon: Receipt,
    title: "Rachunki domowe",
    text: "Prąd, gaz, woda, czynsz, internet, ubezpieczenia. Płatności co 2 miesiące i kwoty orientacyjne dla zmiennych rachunków.",
  },
  {
    icon: FileSearch,
    title: "Znajdź w historii konta",
    text: "Wgraj plik CSV z bankowości — wykryjemy powtarzające się płatności. Plik nie opuszcza Twojej przeglądarki.",
  },
  {
    icon: MailPlus,
    title: "Automatycznie z e-maili",
    text: "W Premium przekazujesz potwierdzenia płatności na swój adres w Opłaciku, a nowe pozycje pojawiają się same.",
  },
];

export function Features() {
  return (
    <section id="funkcje" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent">Funkcje</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Mniej niespodzianek na wyciągu z konta
          </h2>
          <p className="mt-3 text-muted">
            Opłacik nie podgląda Twojego konta — to Ty decydujesz, co dodajesz: ręcznie, z pliku z banku albo z przekazanych e-maili. W zamian dostajesz porządek,
            liczby i przypomnienia na czas.
          </p>
        </div>
        <p className="mt-6 text-xs text-subtle sm:hidden" aria-hidden>
          Przesuń w bok, aby zobaczyć wszystkie →
        </p>
        {/* Phones: one swipeable row instead of nine stacked cards. */}
        <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="group w-[78%] shrink-0 snap-start rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-line-strong hover:bg-surface-2 sm:w-auto sm:p-6"
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
