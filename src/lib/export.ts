import { BILLING_CYCLE_LABELS } from "@/lib/subscriptions/billing";
import { CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import type { Subscription } from "@/lib/subscriptions/types";

const HEADERS = [
  "Nazwa",
  "Kwota (zł)",
  "Kwota orientacyjna",
  "Cykl",
  "Następna płatność",
  "Koniec okresu próbnego",
  "Kategoria",
  "Status",
  "Link do zarządzania",
  "Notatka",
];

function cell(value: string): string {
  // Neutralise spreadsheet formulas and quote every field.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** CSV for Polish Excel: semicolons, comma decimals, UTF-8 BOM. */
export function subscriptionsToCsv(subscriptions: Subscription[]): string {
  const rows = subscriptions.map((s) =>
    [
      s.name,
      (s.amountCents / 100).toFixed(2).replace(".", ","),
      s.amountIsEstimate ? "tak" : "nie",
      BILLING_CYCLE_LABELS[s.billingCycle],
      s.nextPaymentDate,
      s.trialEndsAt ?? "",
      s.category ? CATEGORY_LABELS[s.category] : "",
      s.status === "active" ? "aktywna" : "anulowana",
      s.manageUrl ?? "",
      s.notes ?? "",
    ]
      .map(cell)
      .join(";"),
  );
  return `﻿${[HEADERS.map(cell).join(";"), ...rows].join("\r\n")}\r\n`;
}
