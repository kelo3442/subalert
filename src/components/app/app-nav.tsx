"use client";

import { CalendarDays, LayoutDashboard, ListChecks, PiggyBank, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const START = { href: "/panel", label: "Start", icon: LayoutDashboard, exact: true };
const PAYMENTS = { href: "/panel/subskrypcje", label: "Moje opłaty", short: "Opłaty", icon: ListChecks, exact: false };
const SAVINGS = { href: "/panel/oszczedzaj", label: "Oszczędzaj", icon: PiggyBank, exact: false };
const CALENDAR = { href: "/panel/kalendarz", label: "Kalendarz", icon: CalendarDays, exact: false };
const SETTINGS = { href: "/panel/ustawienia", label: "Ustawienia", icon: Settings, exact: false };

const ITEMS = [START, PAYMENTS, SAVINGS, CALENDAR, SETTINGS];
// Phones have room for four tabs around the "+" button; the calendar is reachable from "Opłaty".
const MOBILE_ITEMS = [START, PAYMENTS, SAVINGS, SETTINGS];

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

function MobileNavItem({
  href,
  label,
  short,
  icon: Icon,
  exact,
  compact,
}: (typeof ITEMS)[number] & { short?: string; compact?: boolean }) {
  const isActive = useIsActive();
  const active = isActive(href, exact);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 text-xs font-semibold transition-colors",
        compact ? "rounded-xl py-1.5" : "py-2",
        active ? "text-accent" : "text-muted",
        compact && active && "bg-surface-2",
      )}
    >
      <Icon className="size-5" aria-hidden />
      {short ?? label}
    </Link>
  );
}

/**
 * Bottom tab bar for the installed app. In a phone browser the browser's own
 * toolbar and the home indicator cover the bottom edge, so there the same
 * items are shown at the top instead (see MobileTopNav and globals.css).
 */
export function MobileNav() {
  const [first, second, third, fourth] = MOBILE_ITEMS;
  return (
    <nav
      aria-label="Nawigacja aplikacji"
      className="app-nav-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-2">
        <MobileNavItem {...first} />
        <MobileNavItem {...second} />
        <Link
          href="/panel/subskrypcje/nowa"
          aria-label="Dodaj opłatę"
          className="mx-1 -mt-5 grid size-14 place-items-center rounded-2xl bg-accent text-accent-ink shadow-lg shadow-accent/20 transition-transform active:scale-95"
        >
          <Plus className="size-6" aria-hidden />
        </Link>
        <MobileNavItem {...third} />
        <MobileNavItem {...fourth} />
      </div>
    </nav>
  );
}

/** The same navigation as a row under the header, used in a phone browser. */
export function MobileTopNav() {
  const [first, second, third, fourth] = MOBILE_ITEMS;
  return (
    <nav aria-label="Nawigacja aplikacji" className="app-nav-top border-t border-line px-2 py-1.5 lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch gap-1">
        <MobileNavItem {...first} compact />
        <MobileNavItem {...second} compact />
        <Link
          href="/panel/subskrypcje/nowa"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-accent py-1.5 text-xs font-semibold text-accent-ink transition-transform active:scale-95"
        >
          <Plus className="size-5" aria-hidden />
          Dodaj
        </Link>
        <MobileNavItem {...third} compact />
        <MobileNavItem {...fourth} compact />
      </div>
    </nav>
  );
}
