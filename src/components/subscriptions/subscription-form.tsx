"use client";

import { Hourglass, Info, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { z } from "zod";
import type { FormState } from "@/actions/form-state";
import { createSubscription, updateSubscription } from "@/actions/subscriptions";
import { Alert } from "@/components/ui/alert";
import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { BILLING_CYCLE_LABELS, BILLING_CYCLES, type BillingCycle } from "@/lib/subscriptions/billing";
import { CATEGORY_KEYS, CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import { FEATURED_SERVICES, type PopularService } from "@/lib/subscriptions/popular-services";
import {
  subscriptionInputFromFormData,
  subscriptionSchema,
  type SubscriptionField,
} from "@/lib/validation/subscription";

export interface SubscriptionFormValues {
  name: string;
  amount: string;
  amountIsEstimate: boolean;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  hasTrial: boolean;
  trialEndsAt: string;
  category: string;
  manageUrl: string;
  notes: string;
  status: "active" | "cancelled";
}

type Errors = Partial<Record<SubscriptionField, string[]>>;
const initialState: FormState<SubscriptionField> = { status: "idle" };

interface Props {
  mode: "create" | "edit";
  subscriptionId?: string;
  /** Set when the form was opened from a subscription detected in an e-mail. */
  detectedId?: string;
  initialValues: SubscriptionFormValues;
}

export function SubscriptionForm({ mode, subscriptionId, detectedId, initialValues }: Props) {
  const serverAction =
    mode === "edit" && subscriptionId ? updateSubscription.bind(null, subscriptionId) : createSubscription;
  const [state, formAction, isPending] = useActionState(serverAction, initialState);
  const [values, setValues] = useState(initialValues);
  const [clientErrors, setClientErrors] = useState<Errors | null>(null);
  const errors: Errors = clientErrors ?? state.fieldErrors ?? {};

  const set = <K extends keyof SubscriptionFormValues>(key: K, value: SubscriptionFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (clientErrors?.[key as SubscriptionField]) {
      setClientErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const applyPreset = (service: PopularService) => {
    setValues((current) => ({
      ...current,
      name: service.name,
      category: service.category,
      manageUrl: service.manageUrl ?? current.manageUrl,
      amountIsEstimate: service.category === "utilities" || current.amountIsEstimate,
    }));
    setClientErrors(null);
  };

  const onTrialEndChange = (date: string) => {
    setValues((current) => ({
      ...current,
      trialEndsAt: date,
      // The first charge usually follows the trial; prefill when empty.
      nextPaymentDate: current.nextPaymentDate || date,
    }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = subscriptionSchema.safeParse(subscriptionInputFromFormData(formData));
    if (!parsed.success) {
      setClientErrors(z.flattenError(parsed.error).fieldErrors);
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }
    setClientErrors(null);
    // Submitting manually keeps the inputs filled if the server returns an error.
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {detectedId && <input type="hidden" name="detectedId" value={detectedId} />}
      {state.status === "error" && state.message && !clientErrors && (
        <Alert tone={state.upgrade ? "warn" : "error"}>
          {state.message}
          {state.upgrade && (
            <Link href="/panel/premium" className="mt-2 block font-semibold underline underline-offset-2">
              Zobacz Premium
            </Link>
          )}
        </Alert>
      )}

      <section aria-labelledby="step-what" className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <h2 id="step-what" className="text-lg font-semibold text-fg">
          1. Za co płacisz?
        </h2>
        {mode === "create" && (
          <>
            <p className="mt-1 text-sm text-muted">Stuknij usługę z listy albo wpisz własną nazwę poniżej.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FEATURED_SERVICES.map((service) => {
                const selected = values.name === service.name;
                return (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => applyPreset(service)}
                    aria-pressed={selected}
                    className={cn(
                      "min-h-11 rounded-xl border px-4 py-2 text-base font-medium transition-colors",
                      selected
                        ? "border-accent/60 bg-accent/15 text-accent"
                        : "border-line bg-surface-2 text-fg hover:border-line-strong",
                    )}
                  >
                    {service.name}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <Field id="name" label="Nazwa" errors={errors.name} className="mt-4">
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={80}
            placeholder="np. Netflix, prąd, czynsz"
            invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name", errors.name)}
            autoComplete="off"
          />
        </Field>
      </section>

      <section aria-labelledby="step-amount" className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <h2 id="step-amount" className="text-lg font-semibold text-fg">
          2. Ile i jak często płacisz?
        </h2>
        <Field id="amount" label="Kwota" errors={errors.amount} hint="W złotówkach">
          <div className="relative sm:max-w-xs">
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="49,99"
              className="pr-11 text-lg tabular-nums"
              invalid={Boolean(errors.amount)}
              aria-describedby={describedBy("amount", errors.amount, true)}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-base text-subtle">zł</span>
          </div>
          <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              name="amountIsEstimate"
              checked={values.amountIsEstimate}
              onChange={(e) => set("amountIsEstimate", e.target.checked)}
              className="size-5 accent-[#c4f542]"
            />
            Kwota co miesiąc jest inna — wpisuję mniej więcej (np. prąd, gaz)
          </label>
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-fg">Jak często?</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BILLING_CYCLES.map((cycle) => (
              <label
                key={cycle}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-base font-medium transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  values.billingCycle === cycle
                    ? "border-accent/60 bg-accent/10 text-accent"
                    : "border-line bg-surface-2 text-fg hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="billingCycle"
                  value={cycle}
                  checked={values.billingCycle === cycle}
                  onChange={() => set("billingCycle", cycle)}
                  className="sr-only"
                />
                {BILLING_CYCLE_LABELS[cycle]}
              </label>
            ))}
          </div>
          {errors.billingCycle && <p className="mt-1.5 text-xs text-danger">{errors.billingCycle[0]}</p>}
        </fieldset>
      </section>

      <section aria-labelledby="step-when" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <h2 id="step-when" className="text-lg font-semibold text-fg">
          3. Kiedy jest następna płatność?
        </h2>
        <Field id="nextPaymentDate" label="Data następnej płatności" errors={errors.nextPaymentDate}>
          <Input
            id="nextPaymentDate"
            name="nextPaymentDate"
            type="date"
            value={values.nextPaymentDate}
            onChange={(e) => set("nextPaymentDate", e.target.value)}
            className="text-lg sm:max-w-xs"
            invalid={Boolean(errors.nextPaymentDate)}
            aria-describedby={describedBy("nextPaymentDate", errors.nextPaymentDate)}
          />
        </Field>

        <div className={cn("rounded-xl border p-4 transition-colors", values.hasTrial ? "border-warn/40 bg-warn/[0.05]" : "border-line bg-surface-2")}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="hasTrial"
              checked={values.hasTrial}
              onChange={(e) => set("hasTrial", e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-[#fbbf24]"
            />
            <span>
              <span className="flex items-center gap-2 font-medium text-fg">
                <Hourglass className="size-4 text-warn" aria-hidden /> Teraz mam darmowy okres próbny
              </span>
              <span className="mt-0.5 block text-sm text-muted">
                Przypomnimy Ci przed jego końcem. Kwota wyżej to opłata, która zacznie się po nim.
              </span>
            </span>
          </label>
          {values.hasTrial && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="trialEndsAt" label="Kiedy kończy się darmowy okres?" errors={errors.trialEndsAt}>
                <Input
                  id="trialEndsAt"
                  name="trialEndsAt"
                  type="date"
                  value={values.trialEndsAt}
                  onChange={(e) => onTrialEndChange(e.target.value)}
                  invalid={Boolean(errors.trialEndsAt)}
                  aria-describedby={describedBy("trialEndsAt", errors.trialEndsAt)}
                />
              </Field>
              <p className="flex items-start gap-2 self-end rounded-xl border border-line bg-surface p-3 text-sm leading-relaxed text-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                Opłacik nie anuluje usługi sam — jeśli nie chcesz płacić, zrezygnuj u dostawcy.
              </p>
            </div>
          )}
        </div>
      </section>

      {mode === "edit" ? (
        <fieldset className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
          <legend className="sr-only">Status</legend>
          <p className="mb-2 text-sm font-medium text-fg">Czy nadal za to płacisz?</p>
          <div className="grid grid-cols-2 gap-2">
            {(["active", "cancelled"] as const).map((status) => (
              <label
                key={status}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-base font-medium transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  values.status === status ? "border-accent/60 bg-accent/10 text-accent" : "border-line bg-surface-2 text-fg hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={values.status === status}
                  onChange={() => set("status", status)}
                  className="sr-only"
                />
                {status === "active" ? "Tak, płacę" : "Nie, zrezygnowałem/am"}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <input type="hidden" name="status" value="active" />
      )}

      <details
        className="group rounded-2xl border border-line bg-surface p-4 sm:p-6 [&_summary::-webkit-details-marker]:hidden"
        open={Boolean(initialValues.category || initialValues.manageUrl || initialValues.notes || errors.manageUrl || errors.notes || errors.category)}
      >
        <summary className="cursor-pointer list-none font-medium text-fg">
          Dodatkowe informacje <span className="font-normal text-muted">(nie musisz wypełniać)</span>
        </summary>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field id="category" label="Kategoria" optional errors={errors.category}>
            <Select
              id="category"
              name="category"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              invalid={Boolean(errors.category)}
            >
              <option value="">Bez kategorii</option>
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABELS[key]}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="manageUrl" label="Link do strony, na której zrezygnujesz" optional errors={errors.manageUrl} hint="Strona konta u dostawcy.">
            <Input
              id="manageUrl"
              name="manageUrl"
              type="url"
              inputMode="url"
              value={values.manageUrl}
              onChange={(e) => set("manageUrl", e.target.value)}
              placeholder="https://"
              invalid={Boolean(errors.manageUrl)}
              aria-describedby={describedBy("manageUrl", errors.manageUrl, true)}
            />
          </Field>

          <Field id="notes" label="Notatka" optional errors={errors.notes} className="sm:col-span-2">
            <Textarea
              id="notes"
              name="notes"
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={500}
              placeholder="np. plan rodzinny, płacę kartą mamy"
              invalid={Boolean(errors.notes)}
            />
          </Field>
        </div>
      </details>

      <div className="sticky bottom-20 z-10 flex gap-2 rounded-2xl border border-line bg-bg/90 p-2 backdrop-blur-xl sm:justify-end sm:p-3 lg:bottom-4">
        <Link
          href={mode === "edit" && subscriptionId ? `/panel/subskrypcje/${subscriptionId}` : "/panel/subskrypcje"}
          className={buttonClasses("ghost", "md")}
        >
          Anuluj
        </Link>
        <Button type="submit" size="lg" disabled={isPending} aria-busy={isPending} className="flex-1 sm:flex-none">
          {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {mode === "edit" ? "Zapisz zmiany" : "Zapisz opłatę"}
        </Button>
      </div>
    </form>
  );
}
