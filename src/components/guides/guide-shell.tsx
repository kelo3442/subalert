import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function GuideShell({ back, children }: { back: { href: string; label: string }; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href={back.href} className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted hover:text-fg sm:inline-flex">
              <ArrowLeft className="size-4" aria-hidden /> {back.label}
            </Link>
            <ButtonLink href="/rejestracja" size="sm">
              Załóż konto
            </ButtonLink>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <SiteFooter />
    </>
  );
}

export function ReminderCta({ service }: { service?: string }) {
  return (
    <aside className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-fg">{service ? `Nie daj się zaskoczyć następnej płatności` : "Pilnuj wszystkich subskrypcji w jednym miejscu"}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Opłacik przypomni Ci przed każdą płatnością i przed końcem okresu próbnego, a przy podwyżce ceny od razu to zobaczysz. Założenie
        konta jest darmowe.
      </p>
      <ButtonLink href="/rejestracja" className="mt-4">
        Wypróbuj Opłacik za darmo
      </ButtonLink>
    </aside>
  );
}
