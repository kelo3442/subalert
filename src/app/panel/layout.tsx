import type { ReactNode } from "react";
import { MobileNav, SidebarNav } from "@/components/app/app-nav";
import { SignOutButton } from "@/components/app/sign-out-button";
import { SetupRequired } from "@/components/auth/setup-required";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { requireUser } from "@/lib/data/user";
import { isSupabaseConfigured } from "@/lib/env";
import { Plus } from "lucide-react";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <SetupRequired />
      </main>
    );
  }

  const user = await requireUser();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface/50 p-4 lg:flex">
        <Logo href="/panel" className="px-2 py-2" />
        <ButtonLink href="/panel/subskrypcje/nowa" className="mb-4 mt-6 w-full">
          <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
        </ButtonLink>
        <SidebarNav />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-3 pb-2 text-xs text-subtle" title={user.email}>
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:hidden">
          <Logo href="/panel" />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
