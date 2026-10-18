import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GuideShell, ReminderCta } from "@/components/guides/guide-shell";
import { CANCEL_GUIDES } from "@/lib/cancel-guides/data";

export const metadata: Metadata = {
  title: "Jak anulować subskrypcję — poradniki krok po kroku",
  description:
    "Jak zrezygnować z Netflixa, Disney+, HBO Max, Amazon Prime, Spotify, Playera, CANAL+, SkyShowtime i innych subskrypcji. Instrukcje krok po kroku sprawdzone z oficjalną pomocą.",
  alternates: { canonical: "/jak-anulowac" },
};

export default function CancelGuidesIndex() {
  return (
    <GuideShell back={{ href: "/", label: "Strona główna" }}>
      <h1 className="text-3xl font-semibold tracking-tight text-fg [text-wrap:balance] sm:text-4xl">Jak anulować subskrypcję</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
        Instrukcje krok po kroku dla popularnych usług, sprawdzone z ich oficjalnymi stronami pomocy. Zanim zaczniesz, ustal, gdzie płacisz:
        bezpośrednio w serwisie, przez App Store, Google Play czy u operatora. Anulujesz zawsze tam, gdzie płacisz.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {CANCEL_GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/jak-anulowac/${guide.slug}`}
              className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-fg">{guide.title}</span>
                <span className="mt-1 block text-sm text-muted">{guide.methods.map((m) => m.title).join(" · ")}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <ReminderCta />
      </div>
    </GuideShell>
  );
}
