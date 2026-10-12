"use client";

import { ArrowLeft, ArrowRight, FileSearch, LoaderCircle, MousePointerClick, Plus, Search, ShieldCheck } from "lucide-react";
import { startTransition, useActionState, useMemo, useState } from "react";
import { createSubscriptionsBulk, type BulkFormState } from "@/actions/subscriptions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { nextDateForDayOfMonth, type ISODate } from "@/lib/dates";
import type { RecurringCandidate } from "@/lib/import/recurring";
import { centsToInputValue, formatPLN, parseAmountToCents } from "@/lib/money";
import { totalCosts } from "@/lib/subscriptions/billing";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import { POPULAR_SERVICES, type PopularService } from "@/lib/subscriptions/popular-services";
import {
  MAX_BULK_SUBSCRIPTIONS,
  parseBulkSubscriptions,
  type BulkSubscriptionItem,
  type SubscriptionField,
} from "@/lib/validation/subscription";
import { BankImport } from "./bank-import";
import { QuickStartItem } from "./quick-start-item";
import { ServiceTile } from "./service-tile";
import type { QuickStartEntry } from "./types";

const initialState: BulkFormState = { status: "idle" };
type ItemErrors = Record<number, Partial<Record<SubscriptionField, string>>>;

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pl");
}

function toItem(entry: QuickStartEntry, today: ISODate): BulkSubscriptionItem {
  const nextPaymentDate =
    entry.cycle === "monthly" ? (entry.day ? nextDateForDayOfMonth(today, Number(entry.day)) : "") : entry.date;
  return {
    name: entry.name,
    amount: entry.amount,
    billingCycle: entry.cycle,
    nextPaymentDate,
    category: entry.category ?? "",
    manageUrl: entry.manageUrl ?? "",
  };
}

export function QuickStart({ today, existingNames }: { today: ISODate; existingNames: string[] }) {
  const [state, formAction, isPending] = useActionState(createSubscriptionsBulk, initialState);
  const [step, setStep] = useState<"choose" | "pick" | "import" | "details">("choose");
  const [entries, setEntries] = useState<QuickStartEntry[]>([]);
  const [query, setQuery] = useState("");
  const [customCount, setCustomCount] = useState(0);
  const [clientErrors, setClientErrors] = useState<{ message: string; itemErrors: ItemErrors } | null>(null);

  const existing = useMemo(() => new Set(existingNames.map(normalize)), [existingNames]);
  const selectedNames = new Set(entries.filter((e) => !e.custom).map((e) => e.name));
  const errors = clientErrors ?? (state.status === "error" ? { message: state.message ?? "", itemErrors: state.itemErrors ?? {} } : null);

  const visibleServices = POPULAR_SERVICES.filter((service) => normalize(service.name).includes(normalize(query)));
  const sections = CATEGORY_KEYS.map((category) => ({
    category,
    services: visibleServices.filter((service) => service.category === category),
  })).filter((section) => section.services.length > 0);

  const totals = totalCosts(
    entries.flatMap((entry) => {
      const cents = parseAmountToCents(entry.amount);
      return cents && cents > 0 ? [{ amountCents: cents, billingCycle: entry.cycle }] : [];
    }),
  );

  const toggle = (service: PopularService) => {
    setEntries((current) =>
      current.some((e) => !e.custom && e.name === service.name)
        ? current.filter((e) => e.custom || e.name !== service.name)
        : current.length >= MAX_BULK_SUBSCRIPTIONS
          ? current
          : [
              ...current,
              {
                key: service.name,
                name: service.name,
                category: service.category,
                manageUrl: service.manageUrl,
                custom: false,
                amount: "",
                cycle: "monthly",
                day: "",
                date: "",
              },
            ],
    );
  };

  const addCustom = () => {
    if (entries.length >= MAX_BULK_SUBSCRIPTIONS) return;
    const next = customCount + 1;
    setCustomCount(next);
    setEntries((current) => [
      ...current,
      { key: `custom-${next}`, name: query.trim(), category: null, manageUrl: null, custom: true, amount: "", cycle: "monthly", day: "", date: "" },
    ]);
    setStep("details");
  };

  const addImported = (candidates: RecurringCandidate[]) => {
    const taken = new Set(entries.map((entry) => normalize(entry.name)));
    const imported = candidates
      .filter((candidate) => !taken.has(normalize(candidate.name)))
      .map(
        (candidate): QuickStartEntry => ({
          key: `import-${candidate.key}`,
          name: candidate.name,
          category: candidate.category,
          manageUrl: candidate.manageUrl,
          // Names guessed from bank descriptions stay editable.
          custom: !candidate.knownService,
          amount: centsToInputValue(candidate.amountCents),
          cycle: candidate.cycle,
          day: candidate.cycle === "monthly" ? String(Number(candidate.nextPaymentDate.slice(8, 10))) : "",
          date: candidate.cycle === "monthly" ? "" : candidate.nextPaymentDate,
        }),
      );
    setEntries([...entries, ...imported].slice(0, MAX_BULK_SUBSCRIPTIONS));
    setStep("details");
  };

  const update = (key: string, patch: Partial<QuickStartEntry>) => {
    setEntries((current) => current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry)));
    setClientErrors(null);
  };

  const remove = (key: string) => {
    const remaining = entries.filter((entry) => entry.key !== key);
    setEntries(remaining);
    if (remaining.length === 0) setStep("pick");
    setClientErrors(null);
  };

  const submit = () => {
    const items = entries.map((entry) => toItem(entry, today));
    const json = JSON.stringify(items);
    const result = parseBulkSubscriptions(json);
    if (!result.ok) {
      setClientErrors({ message: result.message, itemErrors: result.itemErrors });
      return;
    }
    setClientErrors(null);
    const formData = new FormData();
    formData.set("items", json);
    startTransition(() => formAction(formData));
  };

  const summary = (
    <p className="min-w-0 text-sm text-muted">
      <span className="font-medium text-fg">{entries.length}</span> wybrano
      {totals.yearlyCents > 0 && (
        <>
          {" · "}
          <span className="font-medium tabular-nums text-fg">{formatPLN(totals.monthlyCents)}</span>/mies.{" · "}
          <span className="font-semibold tabular-nums text-accent">{formatPLN(totals.yearlyCents)}</span>/rok
        </>
      )}
    </p>
  );

  if (step === "choose") {
    const choiceClass =
      "group flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" className={choiceClass} onClick={() => setStep("pick")}>
            <span className="grid size-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <MousePointerClick className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold text-fg">Wybiorę sam</span>
            <span className="text-sm leading-relaxed text-muted">
              Zaznacz usługi z listy ok. 30 popularnych (Netflix, Spotify, siłownia, telefon…) i wpisz kwoty. Około minuty.
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
              Zaczynam <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
          <button type="button" className={choiceClass} onClick={() => setStep("import")}>
            <span className="grid size-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <FileSearch className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold text-fg">Znajdź w historii konta</span>
            <span className="text-sm leading-relaxed text-muted">
              Wgraj plik CSV pobrany z bankowości internetowej, a wykryjemy powtarzające się płatności — także te, o
              których zapomniałeś. Bez logowania do banku.
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
              Wgraj plik <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-subtle">
          <ShieldCheck className="mt-px size-4 shrink-0 text-accent" aria-hidden />
          SubAlert nie łączy się z Twoim bankiem ani skrzynką e-mail. Plik z historią analizujemy wyłącznie w
          przeglądarce i nigdzie go nie wysyłamy. Zapisujemy tylko to, co zatwierdzisz.
        </p>
      </div>
    );
  }

  if (step === "import") {
    return (
      <BankImport
        today={today}
        isExisting={(name) => existing.has(normalize(name))}
        onConfirm={addImported}
        onManual={() => setStep("pick")}
      />
    );
  }

  if (step === "pick") {
    return (
      <div className="flex flex-col gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
          <label htmlFor="qs-search" className="sr-only">
            Szukaj usługi
          </label>
          <Input
            id="qs-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj, np. Netflix, siłownia, telefon…"
            className="pl-10"
            autoComplete="off"
          />
        </div>

        {sections.map(({ category, services }) => (
          <section key={category} aria-labelledby={`qs-${category}`}>
            <h2 id={`qs-${category}`} className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceTile
                  key={service.name}
                  name={service.name}
                  selected={selectedNames.has(service.name)}
                  alreadyAdded={existing.has(normalize(service.name))}
                  onToggle={() => toggle(service)}
                />
              ))}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={addCustom}
          className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-3 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Plus className="size-4" aria-hidden />
          {query.trim() ? `Dodaj „${query.trim()}” jako własną usługę` : "Innej usługi nie ma na liście — dodaj własną"}
        </button>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-subtle">
          <ShieldCheck className="mt-px size-4 shrink-0 text-accent" aria-hidden />
          Nie potrzebujemy dostępu do banku ani skrzynki e-mail. Zapisujemy tylko to, co tu wybierzesz.{" "}
          <button type="button" onClick={() => setStep("import")} className="text-accent hover:underline">
            Masz plik z historią konta?
          </button>
        </p>

        <div className="sticky bottom-20 z-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg/90 p-3 backdrop-blur-xl lg:bottom-4">
          {summary}
          <Button onClick={() => setStep("details")} disabled={entries.length === 0}>
            Dalej <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Wpisz kwoty i terminy. Okres próbny, link do anulowania czy notatkę dodasz później w szczegółach subskrypcji.
      </p>
      {errors?.message && <Alert tone="error">{errors.message}</Alert>}
      <ul className="grid gap-3 md:grid-cols-2">
        {entries.map((entry, index) => (
          <QuickStartItem
            key={entry.key}
            entry={entry}
            errors={errors?.itemErrors[index]}
            onChange={(patch) => update(entry.key, patch)}
            onRemove={() => remove(entry.key)}
          />
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setStep("pick")}>
        <Plus className="size-4" aria-hidden /> Wybierz więcej
      </Button>

      <div className="sticky bottom-20 z-10 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-bg/90 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between lg:bottom-4">
        {summary}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep("pick")} disabled={isPending}>
            <ArrowLeft className="size-4" aria-hidden /> Wstecz
          </Button>
          <Button onClick={submit} disabled={isPending} aria-busy={isPending} className="flex-1 sm:flex-none">
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Dodaj {entries.length === 1 ? "subskrypcję" : `wszystkie (${entries.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
