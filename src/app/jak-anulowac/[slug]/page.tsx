import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideShell, ReminderCta } from "@/components/guides/guide-shell";
import { RichText } from "@/components/guides/rich-text";
import { CANCEL_GUIDES, getCancelGuide } from "@/lib/cancel-guides/data";
import { formatDateLong } from "@/lib/dates";
import { getSiteUrl } from "@/lib/env";

export const dynamicParams = false;

/** "Jak anulować subskrypcję w Google Play" → "Subskrypcję w Google Play". */
function shortName(title: string): string {
  const rest = title.replace(/^Jak anulować /, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

export function generateStaticParams() {
  return CANCEL_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps<"/jak-anulowac/[slug]">): Promise<Metadata> {
  const guide = getCancelGuide((await params).slug);
  if (!guide) return {};
  return {
    title: `${guide.title} — krok po kroku`,
    description: guide.summary,
    alternates: { canonical: `/jak-anulowac/${guide.slug}` },
  };
}

export default async function CancelGuidePage({ params }: PageProps<"/jak-anulowac/[slug]">) {
  const guide = getCancelGuide((await params).slug);
  if (!guide) notFound();
  const others = CANCEL_GUIDES.filter((g) => g.slug !== guide.slug);
  const base = getSiteUrl();
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Opłacik", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Jak anulować subskrypcję", item: `${base}/jak-anulowac` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${base}/jak-anulowac/${guide.slug}` },
    ],
  };

  return (
    <GuideShell back={{ href: "/jak-anulowac", label: "Wszystkie poradniki" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} />
      <nav aria-label="Ścieżka" className="text-sm text-subtle">
        <Link href="/jak-anulowac" className="hover:text-fg">
          Jak anulować subskrypcję
        </Link>{" "}
        / {shortName(guide.title)}
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg [text-wrap:balance] sm:text-4xl">{guide.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{guide.summary}</p>
      <p className="mt-3 text-sm text-subtle">Sprawdzone z oficjalną pomocą {guide.service}: {formatDateLong(guide.verifiedAt)}</p>

      <div className="mt-10 flex flex-col gap-8">
        {guide.methods.map((method) => (
          <section key={method.title} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-fg">{method.title}</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {method.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-ink">{index + 1}</span>
                  <span className="min-w-0 pt-0.5">
                    <RichText value={step} />
                  </span>
                </li>
              ))}
            </ol>
            {method.note && (
              <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm leading-relaxed text-muted">
                <RichText value={method.note} />
              </p>
            )}
          </section>
        ))}

        {guide.afterCancel.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-fg">Co się dzieje po anulowaniu</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted marker:text-subtle">
              {guide.afterCancel.map((item) => (
                <li key={item}>
                  <RichText value={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {guide.tips.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-fg">Warto wiedzieć</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted marker:text-subtle">
              {guide.tips.map((item) => (
                <li key={item}>
                  <RichText value={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <ReminderCta service={guide.service} />

        <section>
          <h2 className="text-base font-semibold text-fg">Źródła</h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-accent hover:underline">
                  {source.label} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            Serwisy czasem zmieniają wygląd menu. Jeśli coś wygląda inaczej, skorzystaj z oficjalnej strony pomocy powyżej. Opłacik nie jest
            powiązany z {guide.service}; nazwy usług należą do ich właścicieli.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-fg">Inne poradniki</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/jak-anulowac/${g.slug}`} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-accent/50 hover:text-fg">
                  {shortName(g.title)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </GuideShell>
  );
}
