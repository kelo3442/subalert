import { Zap } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { QuickStart } from "@/components/onboarding/quick-start";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { todayInTimeZone } from "@/lib/dates";

export const metadata: Metadata = { title: "Szybki start" };

export default async function QuickStartPage() {
  const [profile, subscriptions] = await Promise.all([getUserProfile(), listSubscriptions()]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Zap className="size-6 text-accent" aria-hidden /> Dodaj swoje subskrypcje
          </span>
        }
        description="Zaznacz usługi z listy albo znajdź je w historii konta. Na koniec zobaczysz, ile wydajesz miesięcznie i rocznie."
      />
      <QuickStart
        today={todayInTimeZone(profile.timeZone)}
        existingNames={subscriptions.filter((s) => s.status === "active").map((s) => s.name)}
      />
    </div>
  );
}
