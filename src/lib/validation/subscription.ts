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
    amountIsEstimate: z.boolean(),
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
    amountIsEstimate: formData.get("amountIsEstimate") === "on",
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

export const MAX_BULK_SUBSCRIPTIONS = 40;

const bulkItemSchema = z.object({
  name: z.string(),
  amount: z.string(),
  billingCycle: z.string(),
  nextPaymentDate: z.string(),
  category: z.string().optional(),
  manageUrl: z.string().optional(),
  amountIsEstimate: z.boolean().optional(),
});

export type BulkSubscriptionItem = z.infer<typeof bulkItemSchema>;

export function bulkItemToInput(item: BulkSubscriptionItem): SubscriptionInput {
  return {
    name: item.name,
    amount: item.amount,
    amountIsEstimate: item.amountIsEstimate ?? false,
    billingCycle: item.billingCycle as SubscriptionInput["billingCycle"],
    nextPaymentDate: item.nextPaymentDate,
    hasTrial: false,
    trialEndsAt: "",
    category: item.category ?? "",
    manageUrl: item.manageUrl ?? "",
    notes: "",
    status: "active",
  };
}

export type BulkResult =
  | { ok: true; values: SubscriptionValues[] }
  | { ok: false; message: string; itemErrors: Record<number, Partial<Record<SubscriptionField, string>>> };

/** Validates a JSON list of quick-start items with the same rules as the single form. */
export function parseBulkSubscriptions(json: string): BulkResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, message: "Nieprawidłowe dane formularza.", itemErrors: {} };
  }
  const list = z.array(bulkItemSchema).min(1).max(MAX_BULK_SUBSCRIPTIONS).safeParse(raw);
  if (!list.success) {
    return {
      ok: false,
      message: `Wybierz od 1 do ${MAX_BULK_SUBSCRIPTIONS} subskrypcji.`,
      itemErrors: {},
    };
  }

  const values: SubscriptionValues[] = [];
  const itemErrors: Record<number, Partial<Record<SubscriptionField, string>>> = {};
  list.data.forEach((item, index) => {
    const parsed = subscriptionSchema.safeParse(bulkItemToInput(item));
    if (parsed.success) {
      values.push(parsed.data);
      return;
    }
    const fieldErrors = z.flattenError(parsed.error).fieldErrors as Partial<Record<SubscriptionField, string[]>>;
    itemErrors[index] = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? ""]),
    );
  });

  if (Object.keys(itemErrors).length > 0) {
    return { ok: false, message: "Uzupełnij zaznaczone pola.", itemErrors };
  }
  return { ok: true, values };
}
