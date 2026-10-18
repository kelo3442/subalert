import type { ReactNode } from "react";
import { MobileNav, MobileTopNav, SidebarNav } from "@/components/app/app-nav";
import { FeedbackButton } from "@/components/app/feedback-button";
import { SignOutButton } from "@/components/app/sign-out-button";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { PlanBadge } from "@/components/premium/plan-badge";
import { getPlanStatus } from "@/lib/data/plan";
import { requireUser } from "@/lib/data/user";
import { isAdminEmail } from "@/lib/waitlist";
import { CircleHelp, Plus, Shield } from "lucide-react";
import { DISPLAY_BOOT_SCRIPT } from "@/lib/display";
import Link from "next/link";

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const [user, plan] = await Promise.all([requireUser(), getPlanStatus()]);
  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="panel-app min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <script dangerouslySetInnerHTML={{ __html: DISPLAY_BOOT_SCRIPT }} />
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface/50 p-4 lg:flex">
        <Logo href="/panel" className="px-2 py-2" />
        <ButtonLink href="/panel/subskrypcje/nowa" className="mb-4 mt-6 w-full">
          <Plus className="size-4" aria-hidden /> Dodaj opłatę
        </ButtonLink>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-1">
          {isAdmin && (
            <Link
              href="/panel/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
            >
              <Shield className="size-4" aria-hidden /> Lista Premium
            </Link>
          )}
          <Link
            href="/panel/pomoc"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <CircleHelp className="size-4" aria-hidden /> Pomoc
          </Link>
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
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo href="/panel" />
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link
                  href="/panel/admin"
                  aria-label="Lista Premium"
                  className="grid size-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"
                >
                  <Shield className="size-5" aria-hidden />
                </Link>
              )}
              <FeedbackButton variant="icon" />
              <Link
                href="/panel/pomoc"
                className="ml-1 inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold text-fg hover:bg-surface-2"
              >
                <CircleHelp className="size-4" aria-hidden /> Pomoc
              </Link>
            </div>
          </div>
          <MobileTopNav />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 panel-main px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
