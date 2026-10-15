import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const LINKS = [
  { href: "#jak-dziala", label: "Jak działa" },
  { href: "#funkcje", label: "Funkcje" },
  { href: "#kalkulator", label: "Kalkulator" },
  { href: "#rachunki", label: "Rachunki" },
  { href: "#cennik", label: "Cennik" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Sekcje strony" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/logowanie" className="whitespace-nowrap px-1.5 text-sm font-medium text-muted transition-colors hover:text-fg sm:hidden">
            Zaloguj się
          </Link>
          <div className="hidden sm:block">
            <ButtonLink href="/logowanie" variant="ghost" size="sm">
              Zaloguj się
            </ButtonLink>
          </div>
          <ButtonLink href="/rejestracja" size="sm" className="whitespace-nowrap">
            Załóż konto
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
