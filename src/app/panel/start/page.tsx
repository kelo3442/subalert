import type { Metadata } from "next";
import Link from "next/link";
import { QuickStart } from "@/components/onboarding/quick-start";
import { Logo } from "@/components/ui/logo";
import { getPlanStatus } from "@/lib/data/plan";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { todayInTimeZone } from "@/lib/dates";

export const metadata: Metadata = { title: "Dodaj subskrypcje" };

export default async function QuickStartPage() {
  const [profile, subscriptions, plan] = await Promise.all([getUserProfile(), listSubscriptions(), getPlanStatus()]);
  const active = subscriptions.filter((s) => s.status === "active");

  return (
    <>
      <header className="relative mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo href="/panel" />
        <Link href="/panel" className="rounded-lg px-2 py-1 text-sm text-subtle transition-colors hover:text-muted">
          {active.length > 0 ? "Wróć do panelu" : "Zrobię to później"}
        </Link>
      </header>
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6 sm:pt-8">
        <QuickStart today={todayInTimeZone(profile.timeZone)} existingNames={active.map((s) => s.name)} freeSlots={plan.slotsLeft} />
      </main>
    </>
  );
}
