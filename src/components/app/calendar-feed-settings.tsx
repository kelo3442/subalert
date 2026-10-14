import { CalendarPlus, RefreshCw } from "lucide-react";
import { rotateCalendarLink } from "@/actions/settings";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyButton } from "./copy-button";

/** Private iCalendar link that Google, Apple and Outlook calendars subscribe to. */
export function CalendarFeedSettings({ feedUrl }: { feedUrl: string }) {
  const webcalUrl = feedUrl.replace(/^https?:\/\//, "webcal://");
  const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
  return (
    <Card id="kalendarz" className="scroll-mt-24">
      <CardHeader
        icon={<CalendarPlus className="size-5" aria-hidden />}
        title="Kalendarz w telefonie"
        description="Płatności i końce okresów próbnych same pojawią się w Twoim kalendarzu i będą się aktualizować."
      />
      <div className="flex flex-col gap-4 p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "md")}>
            Dodaj do Kalendarza Google
          </a>
          <a href={webcalUrl} className={buttonClasses("secondary", "md")}>
            Dodaj do iPhone’a / Outlooka
          </a>
        </div>
        <div>
          <p className="text-sm font-medium text-fg">Twój prywatny link</p>
          <p className="mt-2 break-all rounded-xl border border-line bg-bg px-3 py-2.5 font-mono text-xs text-muted" data-testid="calendar-feed-url">
            {feedUrl}
          </p>
          <div className="mt-2">
            <CopyButton value={feedUrl} label="Kopiuj link" />
          </div>
        </div>
        <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-subtle">
          <li>
            Google: na telefonie link otwórz w przeglądarce, a kalendarz włącz w aplikacji Kalendarz Google → Ustawienia. Google odświeża
            subskrybowane kalendarze co kilka godzin.
          </li>
          <li>iPhone: stuknij przycisk powyżej i potwierdź „Subskrybuj”. Przypomnienie pojawi się dzień wcześniej o 9:00.</li>
          <li>Ręcznie: w kalendarzu wybierz „Dodaj kalendarz z adresu URL” i wklej link.</li>
        </ul>
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-subtle">Każdy, kto zna ten link, zobaczy nazwy i kwoty Twoich płatności — nie udostępniaj go.</p>
          <form action={rotateCalendarLink} className="flex flex-col items-start gap-1 sm:items-end">
            <SubmitButton variant="ghost" size="sm" pendingText="Zmieniam…">
              <RefreshCw className="size-4" aria-hidden /> Wygeneruj nowy link
            </SubmitButton>
            <span className="text-[11px] text-subtle">Stary link przestanie działać.</span>
          </form>
        </div>
      </div>
    </Card>
  );
}
