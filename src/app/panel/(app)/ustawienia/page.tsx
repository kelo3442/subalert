import { BellRing, CircleCheck, CircleDashed, KeyRound, TriangleAlert, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/app/delete-account-form";
import { EmailImportSettings } from "@/components/app/email-import-settings";
import { getInboundSettings } from "@/lib/data/detected";
import { getInboundConfig, inboundAddress } from "@/lib/email-import/config";
import { PageHeader } from "@/components/app/page-header";
import { ReminderSettingsForm } from "@/components/app/reminder-settings-form";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { getEmailConfig } from "@/lib/email/resend";
import { getUserProfile } from "@/lib/data/user";

export const metadata: Metadata = { title: "Ustawienia" };

const PREFERRED_ZONES = ["Europe/Warsaw", "Europe/London", "Europe/Berlin", "Europe/Dublin", "Europe/Oslo", "America/New_York", "UTC"];

function timeZoneOptions(current: string): string[] {
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return [...new Set([current, ...PREFERRED_ZONES, ...all])];
}

export default async function SettingsPage({ searchParams }: PageProps<"/panel/ustawienia">) {
  const [profile, params, inbound] = await Promise.all([getUserProfile(), searchParams, getInboundSettings()]);
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
        <EmailImportSettings address={address} settings={inbound} />

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

        <Card>
          <CardHeader icon={<UserRound className="size-5" aria-hidden />} title="Konto" description={profile.email} />
          <div className="flex flex-col gap-1 p-3">
            <ButtonLink href="/panel/ustawienia/haslo" variant="ghost" className="justify-start px-3">
              <KeyRound className="size-[18px]" aria-hidden /> Zmień hasło
            </ButtonLink>
            <SignOutButton />
          </div>
        </Card>

        <Card className="border-danger/25">
          <CardHeader
            icon={<TriangleAlert className="size-5 text-danger" aria-hidden />}
            title="Usunięcie konta"
            description="Trwale usuwa konto i wszystkie dane z SubAlert. Nie anuluje usług u dostawców."
          />
          <div className="p-5">
            <DeleteAccountForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
