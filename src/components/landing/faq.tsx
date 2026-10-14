import { ChevronDown } from "lucide-react";
import { isPremiumSalesOpen } from "@/lib/env";

const premiumOpen = isPremiumSalesOpen();

const QUESTIONS = [
  {
    q: "Czy SubAlert łączy się z moim bankiem albo skrzynką e-mail?",
    a: "Nie. SubAlert nie ma dostępu do banku, karty ani skrzynki pocztowej i niczego nie wykrywa automatycznie. Subskrypcje dodajesz samodzielnie — dzięki temu wiesz dokładnie, jakie dane przechowujemy.",
  },
  {
    q: "Czy SubAlert anuluje subskrypcje za mnie?",
    a: "Nie. Przypominamy o płatnościach i podpowiadamy, gdzie zarządzać usługą, ale anulowanie zawsze robisz sam u dostawcy. Możesz potem oznaczyć subskrypcję jako anulowaną, żeby przestała liczyć się do wydatków.",
  },
  {
    q: "Co się stanie, gdy usunę subskrypcję z SubAlert?",
    a: "Znika tylko z Twojej listy w SubAlert. U dostawcy nic się nie zmienia — jeśli usługa jest aktywna, nadal będzie pobierać opłaty.",
  },
  {
    q: "Jak liczony jest koszt miesięczny?",
    a: "Każdą płatność przeliczamy na rok (tygodniowa × 52, miesięczna × 12, kwartalna × 4, roczna × 1), a następnie dzielimy przez 12. Kwoty liczymy w groszach, żeby uniknąć błędów zaokrągleń.",
  },
  {
    q: "Jak działa Trial Guard?",
    a: "Przy dodawaniu usługi zaznaczasz, że trwa okres próbny, i podajesz datę jego końca oraz kwotę przyszłej płatności. Panel wyróżnia kończące się okresy próbne i pokazuje, ile dni zostało.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Hasła obsługuje Supabase Auth — nie przechowujemy ich samodzielnie. Każdy użytkownik ma dostęp wyłącznie do własnych danych dzięki regułom Row Level Security w bazie danych.",
  },
  {
    q: "Czy mogę korzystać na telefonie?",
    a: "Tak. SubAlert to aplikacja webowa zaprojektowana z myślą o telefonach — działa w przeglądarce, bez instalacji.",
  },
  {
    q: "Czy mogę dodać rachunki za prąd, wodę czy czynsz?",
    a: "Tak. Oprócz subskrypcji dodasz rachunki domowe: prąd, gaz, wodę, czynsz, internet, telefon czy ubezpieczenia. Obsługujemy płatności co 2 miesiące i co pół roku, a przy zmiennych rachunkach wpisujesz kwotę orientacyjną.",
  },
  {
    q: "Ile to kosztuje?",
    a: premiumOpen
      ? "Plan darmowy obejmuje 3 subskrypcje lub rachunki ze wszystkimi podstawowymi funkcjami. Premium kosztuje 9,99 zł miesięcznie albo 79 zł za rok i daje brak limitu oraz automatyczne dodawanie z e-maili."
      : "Plan darmowy obejmuje 3 subskrypcje lub rachunki ze wszystkimi podstawowymi funkcjami. Premium bez limitu i z automatycznym dodawaniem z e-maili startuje wkrótce — planowana cena to 9,99 zł miesięcznie albo 79 zł za rok.",
  },
  {
    q: "Czy Premium odnawia się samo?",
    a: "Plan miesięczny (karta) odnawia się co miesiąc i możesz go anulować w każdej chwili. Plan roczny opłacasz jednorazowo BLIKIEM, Przelewy24 lub kartą — nie odnawia się automatycznie.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line/60 bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-sm font-medium text-accent">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Częste pytania</h2>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-fg">
                {q}
                <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
