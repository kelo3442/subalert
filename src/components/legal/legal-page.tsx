import { ArrowLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { Logo } from "@/components/ui/logo";
import { formatDateLong } from "@/lib/dates";
import { getLegalInfo, LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const legal = getLegalInfo();
  return (
    <>
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Strona główna
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-subtle">Obowiązuje od {formatDateLong(LEGAL_EFFECTIVE_DATE)}</p>
        {!legal.complete && (
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-warn">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Dokument w przygotowaniu — dane usługodawcy nie zostały jeszcze uzupełnione.
          </p>
        )}
        <div className="legal mt-8 flex flex-col gap-4 text-[15px] leading-relaxed text-muted">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 pt-4">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-subtle">{children}</ol>;
}

/** Operator details, or a clearly marked gap when they are not configured. */
export function Operator() {
  const legal = getLegalInfo();
  const missing = <span className="text-warn">[do uzupełnienia]</span>;
  return (
    <span>
      <strong className="text-fg">{legal.operatorName ?? missing}</strong>, {legal.operatorAddress ?? missing}
      {legal.operatorTaxId && <>, NIP {legal.operatorTaxId}</>}, e-mail:{" "}
      {legal.contactEmail ? (
        <a href={`mailto:${legal.contactEmail}`} className="text-accent hover:underline">
          {legal.contactEmail}
        </a>
      ) : (
        missing
      )}
    </span>
  );
}

export function ContactEmail() {
  const email = getLegalInfo().contactEmail;
  return email ? (
    <a href={`mailto:${email}`} className="text-accent hover:underline">
      {email}
    </a>
  ) : (
    <span className="text-warn">[adres e-mail do uzupełnienia]</span>
  );
}
