import { BellRing, CircleCheck, CircleDashed, Download, KeyRound, TriangleAlert, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarFeedSettings } from "@/components/app/calendar-feed-settings";
import { DeleteAccountForm } from "@/components/app/delete-account-form";
import { EmailImportSettings } from "@/components/app/email-import-settings";
import { PlanBadge } from "@/components/premium/plan-badge";
import { AppSettings } from "@/components/pwa/app-settings";
import { getInboundSettings } from "@/lib/data/detected";
import { getPlanStatus } from "@/lib/data/plan";
import { getInboundConfig, inboundAddress } from "@/lib/email-import/config";
import { PageHeader } from "@/components/app/page-header";
import { ReminderSettingsForm } from "@/components/app/reminder-settings-form";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { getEmailConfig } from "@/lib/email/resend";
import { getCalendarToken, getUserProfile } from "@/lib/data/user";
import { getSiteUrl } from "@/lib/env";
import { getPushConfig } from "@/lib/push/send";

export const metadata: Metadata = { title: "Ustawienia" };

const PREFERRED_ZONES = ["Europe/Warsaw", "Europe/London", "Europe/Berlin", "Europe/Dublin", "Europe/Oslo", "America/New_York", "UTC"];

function timeZoneOptions(current: string): string[] {
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return [...new Set([current, ...PREFERRED_ZONES, ...all])];
}

export default async function SettingsPage({ searchParams }: PageProps<"/panel/ustawienia">) {
  const [profile, params, inbound, plan, calendarToken] = await Promise.all([
    getUserProfile(),
    searchParams,
    getInboundSettings(),
    getPlanStatus(),
    getCalendarToken(),
  ]);
  const pushConfig = getPushConfig();
  const emailEnabled = getEmailConfig() !== null;
  const inboundConfig = getInboundConfig();
  const address = inboundConfig && inbound ? inboundAddress(inboundConfig, inbound.token) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ustawienia" />
      {params.haslo === "zmienione" && (
        <Alert tone="success" className="mb-4">
          Hasło zostało zmienione.
        </Alert>
      )}
      <div className="flex flex-col gap-4">
        <PlanBadge plan={plan} variant="card" />
        <EmailImportSettings address={address} settings={inbound} premium={plan.premium} />

        <Card>
          <CardHeader icon={<BellRing className="size-5" aria-hidden />} title="Przypomnienia" description="Przypomnienie nie anuluje subskrypcji — tylko daje Ci czas na decyzję." />
          <div className="p-5">
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-3 text-sm">
              {emailEnabled ? (
                <>
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <p className="text-muted">
                    Wysyłka e-maili jest aktywna. Wiadomości trafią na <span className="text-fg">{profile.email}</span>.
                  </p>
                </>
              ) : (
                <>
                  <CircleDashed className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                  <p className="text-muted">
                    Wysyłka e-maili nie jest jeszcze skonfigurowana na tym serwerze. Twoje ustawienia zostaną zapisane, a
                    terminy przypomnień są wyliczane — ale wiadomości nie są wysyłane.
                  </p>
                </>
              )}
            </div>
            <ReminderSettingsForm
              enabled={profile.enabled}
              daysBefore={profile.daysBefore}
              timeZone={profile.timeZone}
              timeZones={timeZoneOptions(profile.timeZone)}
            />
          </div>
        </Card>

        <AppSettings pushPublicKey={pushConfig?.publicKey ?? null} />
        {calendarToken && <CalendarFeedSettings feedUrl={`${getSiteUrl()}/api/kalendarz/${calendarToken}.ics`} />}

        <Card>
          <CardHeader icon={<UserRound className="size-5" aria-hidden />} title="Konto" description={profile.email} />
          <div className="flex flex-col gap-1 p-3">
            <ButtonLink href="/panel/ustawienia/haslo" variant="ghost" className="justify-start px-3">
              <KeyRound className="size-[18px]" aria-hidden /> Zmień hasło
            </ButtonLink>
            <a href="/api/eksport" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg" download>
              <Download className="size-[18px]" aria-hidden /> Pobierz moje dane (CSV)
            </a>
            <SignOutButton />
          </div>
        </Card>

        <p className="flex gap-4 px-1 text-xs text-subtle">
          <Link href="/regulamin" className="hover:text-fg">
            Regulamin
          </Link>
          <Link href="/prywatnosc" className="hover:text-fg">
            Polityka prywatności
          </Link>
        </p>

        <Card className="border-danger/25">
          <CardHeader
            icon={<TriangleAlert className="size-5 text-danger" aria-hidden />}
            title="Usunięcie konta"
            description="Trwale usuwa konto i wszystkie dane z Opłacika. Nie anuluje usług u dostawców."
          />
          <div className="p-5">
            <DeleteAccountForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
