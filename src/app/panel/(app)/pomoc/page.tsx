import { CircleHelp, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FeedbackButton } from "@/components/app/feedback-button";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { getLegalInfo } from "@/lib/legal";

export const metadata: Metadata = { title: "Pomoc" };

const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: "Jak dodać opłatę?",
    a: (
      <>
        Stuknij zielony przycisk <strong>+</strong> na dole ekranu (na komputerze: „Dodaj opłatę”). Wybierz usługę z listy albo wpisz nazwę,
        podaj kwotę, jak często płacisz i kiedy jest następna płatność. Na koniec stuknij „Zapisz opłatę”.
      </>
    ),
  },
  {
    q: "Kiedy dostanę przypomnienie?",
    a: (
      <>
        Domyślnie 3 dni przed płatnością, e-mailem. Możesz to zmienić w <Link href="/panel/ustawienia">Ustawieniach</Link> przyciskami − i +.
        Jeśli zainstalujesz Opłacik na telefonie, przypomnienie przyjdzie też jako powiadomienie.
      </>
    ),
  },
  {
    q: "Czy Opłacik sam anuluje subskrypcję albo pobiera pieniądze?",
    a: (
      <>
        Nie. Opłacik tylko przypomina i pokazuje, ile płacisz. Nie ma dostępu do Twojego konta w banku. Z usługi rezygnujesz sam, u jej
        dostawcy — podpowiadamy jak w <Link href="/jak-anulowac">poradnikach „Jak anulować”</Link>.
      </>
    ),
  },
  {
    q: "Jak zmienić albo usunąć opłatę?",
    a: (
      <>
        Wejdź w <Link href="/panel/subskrypcje">Moje opłaty</Link> i stuknij wybraną pozycję. Znajdziesz tam przyciski „Edytuj” i „Usuń”. Jeśli
        zrezygnowałeś z usługi, w edycji wybierz „Nie, zrezygnowałem/am”.
      </>
    ),
  },
  {
    q: "Litery są za małe albo ekran za ciemny",
    a: (
      <>
        W <Link href="/panel/ustawienia#wyglad">Ustawieniach → Wygląd</Link> włącz „Większy tekst” albo „Jasny wygląd”.
      </>
    ),
  },
  {
    q: "Jak zainstalować Opłacik na telefonie?",
    a: (
      <>
        W <Link href="/panel/ustawienia#aplikacja">Ustawieniach → Aplikacja na telefon</Link> jest instrukcja krok po kroku. Ikona pojawi się na
        ekranie głównym jak zwykła aplikacja.
      </>
    ),
  },
];

export default function HelpPage() {
  const { contactEmail } = getLegalInfo();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <CircleHelp className="size-7 text-accent" aria-hidden /> Pomoc
          </span>
        }
        description="Najczęstsze pytania. Jeśli czegoś tu nie ma — napisz do nas."
      />
      <div className="flex flex-col gap-3">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group rounded-2xl border border-line bg-surface p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold text-fg">
              {q}
              <span className="text-2xl leading-none text-accent transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-base leading-relaxed text-muted [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_strong]:text-fg">{a}</p>
          </details>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5">
        <h2 className="text-lg font-semibold text-fg">Nadal masz pytanie?</h2>
        <p className="mt-1 text-base text-muted">Napisz do nas — odpowiadamy po ludzku.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <FeedbackButton />
          {contactEmail && (
            <ButtonLink href={`mailto:${contactEmail}`} variant="secondary">
              <Mail className="size-4" aria-hidden /> {contactEmail}
            </ButtonLink>
          )}
        </div>
      </section>
    </div>
  );
}
