import { KeyRound, MailPlus, RefreshCw, ShieldCheck } from "lucide-react";
import { rotateInboundAddress, setAutoAddDetected } from "@/actions/detected";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import type { InboundSettings } from "@/lib/data/detected";
import { CopyButton } from "./copy-button";

/** Keywords only — the filter forwards subscription-related mail, never the whole inbox. */
export const GMAIL_FILTER_QUERY =
  'subject:(subskrypcja OR subskrypcji OR abonament OR członkostwo OR "okres próbny" OR odnowienie OR subscription OR membership OR receipt OR "free trial" OR "your plan")';

export function EmailImportSettings({
  address,
  settings,
  premium,
}: {
  address: string | null;
  settings: InboundSettings | null;
  premium: boolean;
}) {
  return (
    <Card id="automatyczne" className="scroll-mt-24">
      <CardHeader
        icon={<MailPlus className="size-5" aria-hidden />}
        title="Automatyczne dodawanie z e-maili"
        description="Przekazuj potwierdzenia płatności na swój adres SubAlert — nowe subskrypcje pojawią się same."
      />
      <div className="flex flex-col gap-5 p-5">
        {!premium ? (
          <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted">
              <strong className="text-fg">Funkcja Premium.</strong> Ustawiasz raz filtr w Gmailu, a nowe subskrypcje i rachunki
              pojawiają się w SubAlert same.
            </p>
            <ButtonLink href="/panel/premium" size="sm" className="shrink-0">
              Zobacz Premium
            </ButtonLink>
          </div>
        ) : !address || !settings ? (
          <p className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-muted">
            Odbieranie e-maili nie jest jeszcze skonfigurowane na tym serwerze (instrukcja w README, sekcja „Automatyczne
            dodawanie z e-maili”).
          </p>
        ) : (
          <>
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Twój prywatny adres</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="min-w-0 flex-1 truncate rounded-xl border border-line bg-bg px-3 py-2.5 font-mono text-sm text-accent" data-testid="inbound-address">
                  {address}
                </code>
                <CopyButton value={address} label="Kopiuj adres" />
              </div>
              <p className="mt-1.5 text-xs text-subtle">Nie udostępniaj go nikomu — e-maile wysłane na ten adres trafiają do Twojego konta.</p>
            </div>

            {settings.gmailCode && (
              <div className="rounded-xl border border-accent/30 bg-accent/[0.07] p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-fg">
                  <KeyRound className="size-4 text-accent" aria-hidden /> Kod potwierdzenia z Gmaila
                </p>
                <p className="mt-2 font-mono text-2xl tracking-widest text-accent" data-testid="gmail-code">
                  {settings.gmailCode}
                </p>
                <p className="mt-1 text-xs text-muted">Wpisz go w Gmailu, aby potwierdzić przekazywanie na adres SubAlert.</p>
                {settings.gmailLink && (
                  <a href={settings.gmailLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">
                    albo potwierdź jednym kliknięciem
                  </a>
                )}
              </div>
            )}

            <details className="group rounded-xl border border-line bg-surface-2 px-4 [&_summary::-webkit-details-marker]:hidden" open={!settings.gmailCode}>
              <summary className="cursor-pointer list-none py-3 text-sm font-medium text-fg">Jak włączyć w Gmailu (ok. 3 minuty)</summary>
              <ol className="flex list-decimal flex-col gap-2 pb-4 pl-5 text-sm text-muted">
                <li>
                  W Gmailu na komputerze: <strong className="text-fg">Ustawienia → Zobacz wszystkie ustawienia → Przekazywanie i POP/IMAP → Dodaj adres przekazywania</strong> i wklej adres powyżej.
                </li>
                <li>Gmail wyśle kod potwierdzenia — pojawi się on na tej stronie (odśwież ją po chwili). Wpisz go w Gmailu. Nie włączaj przekazywania wszystkich wiadomości.</li>
                <li>
                  Utwórz filtr: w wyszukiwarce Gmaila kliknij ikonę filtrów, w polu <strong className="text-fg">Zawiera słowa</strong> wklej poniższy tekst, wybierz <strong className="text-fg">Utwórz filtr → Przekaż do</strong> i swój adres SubAlert.
                </li>
              </ol>
              <div className="mb-4 flex flex-col gap-2">
                <code className="block break-words rounded-lg border border-line bg-bg p-3 font-mono text-xs text-muted">{GMAIL_FILTER_QUERY}</code>
                <CopyButton value={GMAIL_FILTER_QUERY} label="Kopiuj treść filtra" />
              </div>
              <p className="pb-4 text-xs text-subtle">
                W Outlooku: Ustawienia → Poczta → Reguły → dodaj regułę z tymi słowami i akcją „Przekaż do”. Niektóre konta firmowe blokują
                przekazywanie na zewnątrz.
              </p>
            </details>

            <form action={setAutoAddDetected.bind(null, !settings.autoAdd)} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-fg">
                  Automatyczne dodawanie: <span className={settings.autoAdd ? "text-accent" : "text-muted"}>{settings.autoAdd ? "włączone" : "wyłączone"}</span>
                </p>
                <p className="text-xs text-muted">
                  {settings.autoAdd
                    ? "Rozpoznane usługi z kwotą dodajemy od razu. Pozostałe czekają na Twoje potwierdzenie na pulpicie."
                    : "Wszystkie wykryte subskrypcje czekają na Twoje potwierdzenie na pulpicie."}
                </p>
              </div>
              <SubmitButton variant="secondary" size="sm" pendingText="Zapisywanie…">
                {settings.autoAdd ? "Wyłącz" : "Włącz"}
              </SubmitButton>
            </form>

            <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs text-subtle">
                <ShieldCheck className="mt-px size-4 shrink-0 text-accent" aria-hidden />
                Zapisujemy tylko nadawcę, temat i rozpoznane dane (nazwa, kwota, termin). Treści e-maili nie przechowujemy.
              </p>
              <form action={rotateInboundAddress} className="flex flex-col items-start gap-1 sm:items-end">
                <SubmitButton variant="ghost" size="sm" pendingText="Zmieniam…">
                  <RefreshCw className="size-4" aria-hidden /> Wygeneruj nowy adres
                </SubmitButton>
                <span className="text-[11px] text-subtle">Stary przestanie działać — zmień go też w Gmailu.</span>
              </form>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
