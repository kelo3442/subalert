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
  initialValues: SubscriptionFormValues;
}

export function SubscriptionForm({ mode, subscriptionId, initialValues }: Props) {
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
      {state.status === "error" && state.message && !clientErrors && <Alert tone="error">{state.message}</Alert>}

      {mode === "create" && (
        <section aria-labelledby="presets-title" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <h2 id="presets-title" className="text-sm font-medium text-fg">
            Szybki wybór
          </h2>
          <p className="mt-0.5 text-xs text-muted">Uzupełnimy nazwę, kategorię i link. Kwotę wpisujesz sam — ceny planów się różnią.</p>
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
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {service.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-5 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 sm:p-6">
        <Field id="name" label="Nazwa usługi" errors={errors.name} className="sm:col-span-2">
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={80}
            placeholder="np. Netflix albo własna usługa"
            invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name", errors.name)}
            autoComplete="off"
          />
        </Field>

        <Field id="amount" label="Kwota" errors={errors.amount} hint="Waluta: PLN">
          <div className="relative">
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="49,99"
              className="pr-11 tabular-nums"
              invalid={Boolean(errors.amount)}
              aria-describedby={describedBy("amount", errors.amount, true)}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-subtle">zł</span>
          </div>
        </Field>

        <Field id="nextPaymentDate" label="Data następnej płatności" errors={errors.nextPaymentDate}>
          <Input
            id="nextPaymentDate"
            name="nextPaymentDate"
            type="date"
            value={values.nextPaymentDate}
            onChange={(e) => set("nextPaymentDate", e.target.value)}
            invalid={Boolean(errors.nextPaymentDate)}
            aria-describedby={describedBy("nextPaymentDate", errors.nextPaymentDate)}
          />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-fg">Cykl płatności</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BILLING_CYCLES.map((cycle) => (
              <label
                key={cycle}
                className={cn(
                  "flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                  values.billingCycle === cycle
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg",
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

        <Field
          id="manageUrl"
          label="Link do zarządzania / anulowania"
          optional
          errors={errors.manageUrl}
          hint="Oficjalna strona konta u dostawcy."
        >
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
      </section>

      <section
        className={cn(
          "rounded-2xl border p-4 transition-colors sm:p-6",
          values.hasTrial ? "border-warn/40 bg-warn/[0.05]" : "border-line bg-surface",
        )}
      >
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
              <Hourglass className="size-4 text-warn" aria-hidden /> Trial Guard — trwa darmowy okres próbny
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              Wyróżnimy koniec okresu próbnego w panelu. Kwota powyżej to płatność po jego zakończeniu.
            </span>
          </span>
        </label>
        {values.hasTrial && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="trialEndsAt" label="Koniec okresu próbnego" errors={errors.trialEndsAt}>
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
            <p className="flex items-start gap-2 self-end rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              Przypomnienie nie anuluje subskrypcji automatycznie — zrób to u dostawcy, jeśli nie chcesz płacić.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-5 rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <Field id="notes" label="Notatka" optional errors={errors.notes}>
          <Textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={500}
            placeholder="np. plan rodzinny, płatne kartą firmową"
            invalid={Boolean(errors.notes)}
          />
        </Field>

        {mode === "edit" ? (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-fg">Status</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["active", "cancelled"] as const).map((status) => (
                <label
                  key={status}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-colors",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                    values.status === status
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line bg-surface-2 text-muted hover:text-fg",
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
                  {status === "active" ? "Aktywna" : "Anulowana przeze mnie"}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <input type="hidden" name="status" value="active" />
        )}
      </section>

      <div className="sticky bottom-20 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-bg/90 p-3 backdrop-blur-xl sm:flex-row sm:justify-end lg:bottom-4">
        <Link
          href={mode === "edit" && subscriptionId ? `/panel/subskrypcje/${subscriptionId}` : "/panel/subskrypcje"}
          className={buttonClasses("ghost", "md")}
        >
          Anuluj
        </Link>
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {mode === "edit" ? "Zapisz zmiany" : "Dodaj subskrypcję"}
        </Button>
      </div>
    </form>
  );
}
