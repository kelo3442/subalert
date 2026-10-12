import { Layers, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionList } from "@/components/app/subscription-list";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { todayInTimeZone } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { totalCosts } from "@/lib/subscriptions/billing";

export const metadata: Metadata = { title: "Subskrypcje" };

const TABS = [
  { key: "aktywne", label: "Aktywne", status: "active" },
  { key: "anulowane", label: "Anulowane", status: "cancelled" },
] as const;

export default async function SubscriptionsPage({ searchParams }: PageProps<"/panel/subskrypcje">) {
  const params = await searchParams;
  const tab = TABS.find((t) => t.key === params.widok) ?? TABS[0];
  const [profile, subscriptions] = await Promise.all([getUserProfile(), listSubscriptions()]);
  const today = todayInTimeZone(profile.timeZone);
  const visible = subscriptions.filter((s) => s.status === tab.status);
  const totals = totalCosts(visible);

  return (
    <>
      <PageHeader
        title="Subskrypcje"
        description={
          tab.status === "active" && visible.length > 0
            ? `${visible.length} aktywnych · ${formatPLN(totals.monthlyCents)} miesięcznie · ${formatPLN(totals.yearlyCents)} rocznie`
            : "Wszystko, za co płacisz cyklicznie."
        }
        action={
          <ButtonLink href="/panel/subskrypcje/nowa">
            <Plus className="size-4" aria-hidden /> Dodaj
          </ButtonLink>
        }
      />

      {params.usunieto === "1" && (
        <Alert tone="success" className="mb-4">
          Subskrypcja została usunięta z SubAlert. Pamiętaj, że nie oznacza to anulowania u dostawcy.
        </Alert>
      )}

      <div role="tablist" aria-label="Filtr statusu" className="mb-4 inline-flex rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => {
          const count = subscriptions.filter((s) => s.status === t.status).length;
          const selected = t.key === tab.key;
          return (
            <Link
              key={t.key}
              role="tab"
              aria-selected={selected}
              href={t.key === "aktywne" ? "/panel/subskrypcje" : `/panel/subskrypcje?widok=${t.key}`}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                selected ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label} <span className="text-subtle">{count}</span>
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {visible.length > 0 ? (
          <SubscriptionList subscriptions={visible} today={today} />
        ) : tab.status === "active" ? (
          <EmptyState
            icon={<Layers className="size-6" aria-hidden />}
            title="Brak aktywnych subskrypcji"
            description="Dodaj usługi, za które płacisz — Netflix, Spotify, chmurę, siłownię albo cokolwiek innego."
            action={
              <ButtonLink href="/panel/subskrypcje/nowa">
                <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={<Layers className="size-6" aria-hidden />}
            title="Brak anulowanych"
            description="Gdy anulujesz usługę u dostawcy, oznacz ją w SubAlert — trafi tutaj i przestanie liczyć się do wydatków."
          />
        )}
      </Card>
    </>
  );
}
