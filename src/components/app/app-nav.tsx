"use client";

import { CalendarDays, LayoutDashboard, ListChecks, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const ITEMS = [
  { href: "/panel", label: "Start", icon: LayoutDashboard, exact: true },
  { href: "/panel/subskrypcje", label: "Moje opłaty", short: "Opłaty", icon: ListChecks, exact: false },
  { href: "/panel/kalendarz", label: "Kalendarz", icon: CalendarDays, exact: false },
  { href: "/panel/ustawienia", label: "Ustawienia", icon: Settings, exact: false },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Nawigacja aplikacji" className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors",
              active ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className={cn("size-[18px]", active && "text-accent")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const isActive = useIsActive();
  const [first, second, third, fourth] = ITEMS;
  const renderItem = ({ href, label, short, icon: Icon, exact }: (typeof ITEMS)[number] & { short?: string }) => {
    const active = isActive(href, exact);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors",
          active ? "text-accent" : "text-muted",
        )}
      >
        <Icon className="size-5" aria-hidden />
        {short ?? label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Nawigacja aplikacji"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-2">
        {renderItem(first)}
        {renderItem(second)}
        <Link
          href="/panel/subskrypcje/nowa"
          aria-label="Dodaj opłatę"
          className="mx-1 -mt-5 grid size-14 place-items-center rounded-2xl bg-accent text-accent-ink shadow-lg shadow-accent/20 transition-transform active:scale-95"
        >
          <Plus className="size-6" aria-hidden />
        </Link>
        {renderItem(third)}
        {renderItem(fourth)}
      </div>
    </nav>
  );
}
