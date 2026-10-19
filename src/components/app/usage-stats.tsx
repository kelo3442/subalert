import { Activity } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import type { AdminStats } from "@/lib/admin-stats";

const dayLabel = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" });

function share(part: number, whole: number): string {
  return whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";
}

function Row({ label, value, detail, hint }: { label: string; value: string | number; detail?: string; hint?: string }) {
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-relaxed text-muted">{hint}</p>}
      </div>
      <p className="shrink-0 text-right">
        <span className="text-lg font-semibold tabular-nums text-fg">{value}</span>
        {detail && <span className="block text-xs tabular-nums text-muted">{detail}</span>}
      </p>
    </li>
  );
}

/** How people use Opłacik: counts only, for the operator. */
export function UsageStats({ stats }: { stats: AdminStats | null }) {
  if (!stats) {
    return (
      <Card className="mb-4">
        <CardHeader title="Jak ludzie korzystają" description="Brak danych. Uruchom migrację 20261022000000_admin_stats.sql w Supabase." />
      </Card>
    );
  }
  const max = Math.max(1, ...stats.daily.map((d) => d.count));
  return (
    <Card className="mb-4 overflow-hidden" data-testid="usage-stats">
      <CardHeader
        icon={<Activity className="size-5" aria-hidden />}
        title="Jak ludzie korzystają"
        description="Same liczby, bez danych osobowych. Orientacyjnie dobry znak: ponad 40% kont z co najmniej 3 opłatami i ponad 30% osób wracających po tygodniu."
      />
      <ul className="mt-2 divide-y divide-line">
        <Row label="Nowe konta w ostatnich 7 dniach" value={stats.new_7d} detail={`z ${stats.accounts} wszystkich`} />
        <Row
          label="Dodali co najmniej 1 opłatę"
          value={share(stats.with_items, stats.accounts)}
          detail={`${stats.with_items} z ${stats.accounts}`}
          hint="Reszta założyła konto i nic nie dodała."
        />
        <Row
          label="Dodali 3 lub więcej opłat"
          value={share(stats.with_3_items, stats.accounts)}
          detail={`${stats.with_3_items} z ${stats.accounts} · średnio ${String(stats.avg_items).replace(".", ",")} opłaty`}
          hint="Tacy użytkownicy naprawdę korzystają z Opłacika."
        />
        <Row label="Aktywni w ostatnich 7 dniach" value={stats.active_7d} detail="otworzyli aplikację" />
        <Row
          label="Wrócili po tygodniu"
          value={share(stats.returned, stats.eligible_return)}
          detail={`${stats.returned} z ${stats.eligible_return}`}
          hint="Konta starsze niż 7 dni, które otworzyły aplikację co najmniej tydzień po założeniu. Dokładne od dziś; wcześniej liczy się tylko logowanie."
        />
        <Row label="Korzystają z przekazywania maili" value={stats.email_users} detail={share(stats.email_users, stats.accounts)} />
        <Row label="Mają powiadomienia na telefonie" value={stats.push_users} detail={share(stats.push_users, stats.accounts)} />
      </ul>
      <div className="border-t border-line px-5 py-4">
        <p className="text-sm font-medium text-fg">Nowe konta, ostatnie 14 dni</p>
        <div className="mt-3 flex h-28 items-end gap-1" role="img" aria-label="Liczba nowych kont dziennie w ostatnich 14 dniach">
          {stats.daily.map((d) => (
            <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] tabular-nums text-muted">{d.count || ""}</span>
              <div
                className={d.count ? "w-full rounded-t bg-accent" : "w-full rounded-t bg-line"}
                style={{ height: `${Math.max(3, (d.count / max) * 72)}px` }}
                title={`${dayLabel.format(new Date(`${d.day}T00:00:00Z`))}: ${d.count}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{dayLabel.format(new Date(`${stats.daily[0]?.day}T00:00:00Z`))}</span>
          <span>dziś</span>
        </div>
      </div>
    </Card>
  );
}
