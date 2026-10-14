import type { ReactNode } from "react";
import { MobileNav, SidebarNav } from "@/components/app/app-nav";
import { FeedbackButton } from "@/components/app/feedback-button";
import { SignOutButton } from "@/components/app/sign-out-button";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { PlanBadge } from "@/components/premium/plan-badge";
import { getPlanStatus } from "@/lib/data/plan";
import { requireUser } from "@/lib/data/user";
import { Plus } from "lucide-react";

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const [user, plan] = await Promise.all([requireUser(), getPlanStatus()]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface/50 p-4 lg:flex">
        <Logo href="/panel" className="px-2 py-2" />
        <ButtonLink href="/panel/subskrypcje/nowa" className="mb-4 mt-6 w-full">
          <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
        </ButtonLink>
        <SidebarNav />
        <div className="mt-auto">
          <FeedbackButton />
        </div>
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-4">
          <PlanBadge plan={plan} />
          <p className="truncate px-3 pb-2 text-xs text-subtle" title={user.email}>
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:hidden">
          <Logo href="/panel" />
          <FeedbackButton variant="icon" />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
