import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { GuideShell } from "@/components/guides/guide-shell";
import { StatementCheck } from "@/components/landing/statement-check";
import { getCurrentUser } from "@/lib/data/user";

export const metadata: Metadata = {
  title: "Sprawdź, za co płacisz co miesiąc — bez zakładania konta",
  description:
    "Wgraj historię konta z banku (CSV lub Excel) i w kilka sekund zobacz wszystkie stałe opłaty i subskrypcje. Plik nie opuszcza Twojego urządzenia.",
  alternates: { canonical: "/sprawdz" },
};

export default async function StatementCheckPage() {
  const user = await getCurrentUser();
  return (
    <GuideShell back={{ href: "/", label: "Strona główna" }}>
      <p className="text-sm font-medium text-accent">Bez zakładania konta</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg [text-wrap:balance] sm:text-4xl">
        Sprawdź, czy nie płacisz za coś, o czym zapomniałeś
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
        Wgraj historię konta z bankowości internetowej. W kilka sekund zobaczysz wszystkie stałe opłaty: subskrypcje, aplikacje,
        abonamenty i rachunki — także te, o których nie pamiętasz.
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm text-subtle">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        Bez podpinania banku i bez podawania haseł. Plik analizujemy w Twojej przeglądarce.
      </p>
      <div className="mt-8">
        <StatementCheck loggedIn={user !== null} />
      </div>
    </GuideShell>
  );
}
