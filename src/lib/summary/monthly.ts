import { addDays, addMonthsClamped, formatDateLong, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { computeSavings } from "@/lib/savings/savings";
import { usageQuestions, type UsageAnswer } from "@/lib/savings/usage";
import { scheduleBetween } from "@/lib/subscriptions/schedule";
import type { Subscription } from "@/lib/subscriptions/types";

// "W listopadzie zapłacisz…"
const MONTH_LOCATIVE = [
  "styczniu",
  "lutym",
  "marcu",
  "kwietniu",
  "maju",
  "czerwcu",
  "lipcu",
  "sierpniu",
  "wrześniu",
  "październiku",
  "listopadzie",
  "grudniu",
];

export interface MonthlySummary {
  month: ISODate;
  monthName: string;
  totalCents: number;
  estimate: boolean;
  paymentCount: number;
  /** Charges that are not monthly (yearly, quarterly…): the ones people forget. */
  renewals: { name: string; date: ISODate; amountCents: number }[];
  trialsEnding: { name: string; date: ISODate; amountCents: number }[];
  savingsYearlyCents: number;
  /** Plans to ask "did you use it?" about this month. */
  usageQuestionCount: number;
}

export function buildMonthlySummary(
  subscriptions: Subscription[],
  answers: UsageAnswer[],
  today: ISODate,
  now: Date = new Date(),
): MonthlySummary {
  const month = `${today.slice(0, 7)}-01`;
  const end = addDays(addMonthsClamped(month, 1), -1);
  const events = scheduleBetween(subscriptions, today, month < today ? today : month, end);
  const payments = events.filter((e) => e.kind === "payment");
  return {
    month,
    monthName: MONTH_LOCATIVE[Number(month.slice(5, 7)) - 1],
    totalCents: payments.reduce((sum, e) => sum + e.subscription.amountCents, 0),
    estimate: payments.some((e) => e.subscription.amountIsEstimate),
    paymentCount: payments.length,
    renewals: payments
      .filter((e) => e.subscription.billingCycle !== "monthly" && e.subscription.billingCycle !== "weekly")
      .map((e) => ({ name: e.subscription.name, date: e.date, amountCents: e.subscription.amountCents })),
    trialsEnding: events
      .filter((e) => e.kind === "trial_end")
      .map((e) => ({ name: e.subscription.name, date: e.date, amountCents: e.subscription.amountCents })),
    savingsYearlyCents: computeSavings(subscriptions, now).yearlyCents,
    usageQuestionCount: usageQuestions(subscriptions, answers, today).length,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function buildMonthlySummaryEmail(summary: MonthlySummary, appUrl: string) {
  const amount = `${summary.estimate ? "ok. " : ""}${formatPLN(summary.totalCents)}`;
  const subject =
    summary.paymentCount > 0
      ? `W ${summary.monthName} zapłacisz ${amount} stałych opłat`
      : `W ${summary.monthName} nie masz zaplanowanych stałych opłat`;

  const notes: string[] = [];
  for (const r of summary.renewals) {
    notes.push(`${r.name} odnowi się ${formatDateLong(r.date)} — ${formatPLN(r.amountCents)}. To płatność rzadsza niż co miesiąc, łatwo o niej zapomnieć.`);
  }
  for (const t of summary.trialsEnding) {
    notes.push(`Okres próbny ${t.name} kończy się ${formatDateLong(t.date)}. Potem ${formatPLN(t.amountCents)}. Jeśli nie chcesz płacić, zrezygnuj wcześniej.`);
  }

  const usageUrl = `${appUrl}/panel/oszczedzaj#uzywanie`;
  const panelUrl = `${appUrl}/panel`;
  const importUrl = `${appUrl}/panel/start`;
  const statement = "Masz nowy wyciąg z banku? Wgraj go, a pokażemy, czy doszła jakaś nowa stała opłata albo coś podrożało.";
  const settingsUrl = `${appUrl}/panel/ustawienia`;
  const lead =
    summary.paymentCount > 0
      ? `Płatności w tym miesiącu: ${summary.paymentCount}, razem ${amount}.`
      : "W tym miesiącu nie czekają Cię żadne stałe opłaty zapisane w Opłaciku.";
  const savings =
    summary.savingsYearlyCents > 0 ? `Dzięki rezygnacjom oszczędzasz ${formatPLN(summary.savingsYearlyCents)} rocznie. Tak trzymaj!` : null;
  const usage =
    summary.usageQuestionCount > 0
      ? `Korzystałeś ze wszystkiego w ostatnim miesiącu? Sprawdź w 30 sekund: ${summary.usageQuestionCount === 1 ? "1 usługa" : `${summary.usageQuestionCount} usługi`} do kliknięcia „tak” albo „nie”.`
      : null;

  const text = [
    lead,
    "",
    ...(notes.length ? ["Zwróć uwagę:", ...notes.map((n) => `- ${n}`), ""] : []),
    ...(usage ? [usage, usageUrl, ""] : []),
    ...(savings ? [savings, ""] : []),
    statement,
    importUrl,
    "",
    `Wszystkie płatności: ${panelUrl}`,
    "",
    `Podsumowanie wysyłamy raz w miesiącu. Wyłączysz je w ustawieniach: ${settingsUrl}`,
  ].join("\n");

  const noteHtml = notes.length
    ? `<p style="margin:0 0 8px;font-weight:bold">Zwróć uwagę:</p><ul style="margin:0 0 16px;padding-left:20px;line-height:1.5">${notes
        .map((n) => `<li style="margin:0 0 6px">${escapeHtml(n)}</li>`)
        .join("")}</ul>`
    : "";
  const usageHtml = usage
    ? `<div style="margin:0 0 16px;padding:14px;background:#f7fee7;border-radius:8px"><p style="margin:0 0 10px;line-height:1.5">${escapeHtml(usage)}</p><a href="${escapeHtml(usageUrl)}" style="display:inline-block;padding:10px 16px;background:#c4f542;color:#0c1002;border-radius:8px;font-weight:bold;text-decoration:none">Sprawdź, z czego korzystasz</a></div>`
    : "";
  const savingsHtml = savings ? `<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(savings)}</p>` : "";

  const html = `<!doctype html>
<html lang="pl"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:18px">Opłacik</p>
<h1 style="margin:0 0 12px;font-size:20px">${escapeHtml(subject)}</h1>
<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(lead)}</p>
${noteHtml}${usageHtml}${savingsHtml}
<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(statement)} <a href="${escapeHtml(importUrl)}" style="color:#4d7c0f">Wgraj wyciąg</a></p>
<p style="margin:0"><a href="${escapeHtml(panelUrl)}" style="color:#4d7c0f">Zobacz wszystkie płatności</a></p>
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#71717a">Podsumowanie wysyłamy raz w miesiącu. <a href="${escapeHtml(settingsUrl)}" style="color:#71717a">Wyłączysz je w ustawieniach</a>.</p>
</body></html>`;

  return { subject, html, text };
}
