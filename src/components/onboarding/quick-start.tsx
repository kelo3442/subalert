"use client";

import { ArrowLeft, ArrowRight, FileSearch, LoaderCircle, MousePointerClick, Plus, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import { createSubscriptionsBulk, type BulkFormState } from "@/actions/subscriptions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { nextDateForDayOfMonth, type ISODate } from "@/lib/dates";
import { isPremiumSalesOpen } from "@/lib/env";
import { takePendingImport } from "@/lib/import/pending-import";
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

/** "pozycję", "pozycje", "pozycji" for the accusative after "dodać". */
function itemsWord(count: number) {
  if (count === 1) return "pozycję";
  const lastTwo = count % 100;
  return count % 10 >= 2 && count % 10 <= 4 && (lastTwo < 12 || lastTwo > 14) ? "pozycje" : "pozycji";
}

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
    // Utility bills vary from period to period; the entered amount is an estimate.
    amountIsEstimate: entry.category === "utilities",
  };
}

function StepHeading({ title, description, center = false }: { title: string; description: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-8 max-w-2xl text-center" : "mb-6"}>
      <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted sm:text-base">{description}</p>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
      <ArrowLeft className="size-4" aria-hidden /> Zmień sposób
    </button>
  );
}

export function QuickStart({
  today,
  existingNames,
  freeSlots,
}: {
  today: ISODate;
  existingNames: string[];
  /** Remaining free-plan slots; null on Premium. */
  freeSlots: number | null;
}) {
  const [state, formAction, isPending] = useActionState(createSubscriptionsBulk, initialState);
  const [step, setStep] = useState<"choose" | "pick" | "import" | "details">("choose");
  const [entries, setEntries] = useState<QuickStartEntry[]>([]);
  const [query, setQuery] = useState("");
  const [customCount, setCustomCount] = useState(0);
  const [clientErrors, setClientErrors] = useState<{ message: string; itemErrors: ItemErrors; upgrade?: boolean } | null>(null);

  const existing = useMemo(() => new Set(existingNames.map(normalize)), [existingNames]);
  const selectedNames = new Set(entries.filter((e) => !e.custom).map((e) => e.name));
  const errors =
    clientErrors ??
    (state.status === "error" ? { message: state.message ?? "", itemErrors: state.itemErrors ?? {}, upgrade: state.upgrade } : null);
  const overLimit = freeSlots !== null && entries.length > freeSlots;

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
          // Items from the quick check have no known date yet: the person picks the day.
          day: candidate.cycle === "monthly" && candidate.nextPaymentDate ? String(Number(candidate.nextPaymentDate.slice(8, 10))) : "",
          date: candidate.cycle === "monthly" ? "" : candidate.nextPaymentDate,
        }),
      );
    setEntries([...entries, ...imported].slice(0, MAX_BULK_SUBSCRIPTIONS));
    setStep("details");
  };

  // Payments picked on the public statement check before signing up.
  const [fromCheck, setFromCheck] = useState(false);
  useEffect(() => {
    const pending = takePendingImport().filter((candidate) => !existing.has(normalize(candidate.name)));
    if (pending.length === 0) return;
    // Browser storage is only readable after hydration, so this one-time read has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFromCheck(true);
    addImported(pending);
    // Runs once on arrival; addImported only reads the (empty) initial list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (overLimit) {
      setClientErrors({
        message: `Darmowy plan pozwala dodać jeszcze ${freeSlots} ${itemsWord(freeSlots)}. ${isPremiumSalesOpen() ? "Usuń nadmiarowe albo przejdź na Premium." : "Usuń nadmiarowe — Premium bez limitu będzie dostępne wkrótce."}`,
        itemErrors: {},
        upgrade: true,
      });
      return;
    }
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
      "group relative flex min-h-[15rem] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 p-8 text-center transition-all duration-200 sm:min-h-[22rem] " +
      "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent hover:-translate-y-0.5 active:scale-[0.99]";
    return (
      <div className="flex flex-1 flex-col">
        <StepHeading
          center
          title="Jak chcesz dodać swoje subskrypcje?"
          description="Wybierz jedną z opcji. Na koniec zobaczysz, ile wydajesz miesięcznie i rocznie."
        />
        <div className="grid flex-1 gap-4 md:grid-cols-2 md:gap-6">
          <button
            type="button"
            className={`${choiceClass} border-line bg-surface hover:border-accent/60 hover:bg-surface-2`}
            onClick={() => setStep("pick")}
          >
            <span className="grid size-20 place-items-center rounded-3xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-105">
              <MousePointerClick className="size-10" aria-hidden />
            </span>
            <span className="text-2xl font-semibold text-fg sm:text-3xl">Wybiorę sam</span>
            <span className="max-w-xs text-base leading-relaxed text-muted">
              Kliknij usługi, z których korzystasz — Netflix, Spotify, siłownia, telefon… — i wpisz kwoty.
            </span>
            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
              Około minuty <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
          <button
            type="button"
            className={`${choiceClass} border-accent/40 bg-gradient-to-b from-accent/[0.10] to-surface hover:border-accent`}
            onClick={() => setStep("import")}
          >
            <span className="grid size-20 place-items-center rounded-3xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-105">
              <FileSearch className="size-10" aria-hidden />
            </span>
            <span className="text-2xl font-semibold text-fg sm:text-3xl">Znajdź w historii konta</span>
            <span className="max-w-xs text-base leading-relaxed text-muted">
              Wgraj plik z bankowości internetowej — wykryjemy powtarzające się płatności, także te zapomniane.
            </span>
            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
              Wgraj plik CSV <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        </div>
        <p className="mx-auto mt-6 flex max-w-2xl items-start gap-2 text-center text-xs leading-relaxed text-subtle sm:items-center">
          <ShieldCheck className="mt-px size-4 shrink-0 text-accent sm:mt-0" aria-hidden />
          Opłacik nie łączy się z Twoim bankiem. Plik analizujemy wyłącznie w przeglądarce i nigdzie go nie wysyłamy.
        </p>
      </div>
    );
  }

  if (step === "import") {
    return (
      <div>
        <BackLink onClick={() => setStep("choose")} />
        <StepHeading title="Znajdź w historii konta" description="Wykryjemy płatności, które powtarzają się co tydzień, miesiąc, kwartał lub rok." />
        <BankImport
        today={today}
        isExisting={(name) => existing.has(normalize(name))}
        onConfirm={addImported}
        onManual={() => setStep("pick")}
        />
      </div>
    );
  }

  if (step === "pick") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <BackLink onClick={() => setStep("choose")} />
          <StepHeading title="Z czego korzystasz?" description="Zaznacz usługi, za które płacisz cyklicznie. W następnym kroku wpiszesz kwoty." />
        </div>
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

        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg/90 p-3 backdrop-blur-xl">
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
      <StepHeading
        title="Wpisz kwoty i terminy"
        description="Okres próbny, link do anulowania czy notatkę dodasz później w szczegółach subskrypcji."
      />
      {fromCheck && (
        <Alert tone="info">
          To płatności zaznaczone przy sprawdzaniu wyciągu. Popraw kwoty lub terminy, jeśli trzeba, i zapisz — wtedy przypomnimy
          Ci o nich przed każdą płatnością.
        </Alert>
      )}
      {freeSlots !== null && !errors?.message && (
        <Alert tone={overLimit ? "warn" : "info"}>
          Plan darmowy: możesz dodać jeszcze {freeSlots} {itemsWord(freeSlots)}.{" "}
          <Link href="/panel/premium" className="font-semibold underline underline-offset-2">
            Premium bez limitu
          </Link>
        </Alert>
      )}
      {errors?.message && (
        <Alert tone={errors.upgrade ? "warn" : "error"}>
          {errors.message}
          {errors.upgrade && (
            <Link href="/panel/premium" className="mt-2 block font-semibold underline underline-offset-2">
              {isPremiumSalesOpen() ? "Przejdź na Premium — 9,99 zł/mies. lub 79 zł/rok" : "Premium bez limitu — wkrótce"}
            </Link>
          )}
        </Alert>
      )}
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

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-bg/90 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
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
