import { z } from "zod";
import { MAX_AMOUNT_CENTS, parseAmountToCents } from "@/lib/money";
import { BILLING_CYCLES } from "@/lib/subscriptions/billing";
import { CATEGORY_KEYS } from "@/lib/subscriptions/categories";
import { SUBSCRIPTION_STATUSES } from "@/lib/subscriptions/types";
import { emptyToUndefined, isHttpUrl, isoDateField, readString } from "./shared";

export const subscriptionSchema = z
  .object({
    name: z
      .string("Podaj nazwę usługi.")
      .trim()
      .min(1, "Podaj nazwę usługi.")
      .max(80, "Nazwa może mieć maksymalnie 80 znaków."),
    amount: z
      .string("Podaj kwotę.")
      .trim()
      .min(1, "Podaj kwotę.")
      .transform((value, ctx) => {
        const cents = parseAmountToCents(value);
        if (cents === null) {
          ctx.addIssue({ code: "custom", message: "Podaj kwotę w formacie np. 49,99." });
          return z.NEVER;
        }
        if (cents <= 0) {
          ctx.addIssue({ code: "custom", message: "Kwota musi być większa od zera." });
          return z.NEVER;
        }
        if (cents > MAX_AMOUNT_CENTS) {
          ctx.addIssue({ code: "custom", message: "Kwota nie może przekraczać 100 000 zł." });
          return z.NEVER;
        }
        return cents;
      }),
    billingCycle: z.enum(BILLING_CYCLES, "Wybierz cykl płatności."),
    nextPaymentDate: isoDateField("Podaj datę następnej płatności."),
    hasTrial: z.boolean(),
    trialEndsAt: z.preprocess(emptyToUndefined, isoDateField("Podaj datę końca okresu próbnego.").optional()),
    category: z.preprocess(emptyToUndefined, z.enum(CATEGORY_KEYS, "Wybierz kategorię z listy.").optional()),
    manageUrl: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(500, "Link jest za długi.")
        .refine(isHttpUrl, "Podaj pełny adres zaczynający się od https://")
        .optional(),
    ),
    notes: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(500, "Notatka może mieć maksymalnie 500 znaków.").optional(),
    ),
    status: z.enum(SUBSCRIPTION_STATUSES, "Nieprawidłowy status."),
  })
  .superRefine((value, ctx) => {
    if (value.hasTrial && !value.trialEndsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["trialEndsAt"],
        message: "Podaj datę końca okresu próbnego.",
      });
    }
  })
  .transform(({ hasTrial, trialEndsAt, amount, category, manageUrl, notes, ...rest }) => ({
    ...rest,
    amountCents: amount,
    trialEndsAt: hasTrial ? (trialEndsAt ?? null) : null,
    category: category ?? null,
    manageUrl: manageUrl ?? null,
    notes: notes ?? null,
  }));

export type SubscriptionInput = z.input<typeof subscriptionSchema>;
export type SubscriptionValues = z.output<typeof subscriptionSchema>;
export type SubscriptionField = keyof SubscriptionInput;

export function subscriptionInputFromFormData(formData: FormData): SubscriptionInput {
  return {
    name: readString(formData, "name"),
    amount: readString(formData, "amount"),
    billingCycle: readString(formData, "billingCycle") as SubscriptionInput["billingCycle"],
    nextPaymentDate: readString(formData, "nextPaymentDate"),
    hasTrial: formData.get("hasTrial") === "on",
    trialEndsAt: readString(formData, "trialEndsAt"),
    category: readString(formData, "category"),
    manageUrl: readString(formData, "manageUrl"),
    notes: readString(formData, "notes"),
    status: (readString(formData, "status") || "active") as SubscriptionInput["status"],
  };
}
