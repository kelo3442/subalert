import { BellRing, CircleCheck, CircleDashed, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { ReminderSettingsForm } from "@/components/app/reminder-settings-form";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Card, CardHeader } from "@/components/ui/card";
import { getEmailConfig } from "@/lib/email/resend";
import { getUserProfile } from "@/lib/data/user";

export const metadata: Metadata = { title: "Ustawienia" };

const PREFERRED_ZONES = ["Europe/Warsaw", "Europe/London", "Europe/Berlin", "Europe/Dublin", "Europe/Oslo", "America/New_York", "UTC"];

function timeZoneOptions(current: string): string[] {
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return [...new Set([current, ...PREFERRED_ZONES, ...all])];
}

export default async function SettingsPage() {
  const profile = await getUserProfile();
  const emailEnabled = getEmailConfig() !== null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ustawienia" />
      <div className="flex flex-col gap-4">
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
          <div className="p-3">
            <SignOutButton />
          </div>
        </Card>
      </div>
    </div>
  );
}
