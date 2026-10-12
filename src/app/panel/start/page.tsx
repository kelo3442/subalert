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
            <Zap className="size-6 text-accent" aria-hidden /> Z czego korzystasz?
          </span>
        }
        description="Zaznacz usługi, za które płacisz cyklicznie. W następnym kroku wpiszesz kwoty — zobaczysz od razu, ile to rocznie."
      />
      <QuickStart
        today={todayInTimeZone(profile.timeZone)}
        existingNames={subscriptions.filter((s) => s.status === "active").map((s) => s.name)}
      />
    </div>
  );
}
