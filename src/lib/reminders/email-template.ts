import { daysBetween, formatDateLong, formatRelativeDays, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import type { ReminderKind } from "./schedule";

export interface ReminderEmailInput {
  kind: ReminderKind;
  subscriptionName: string;
  amountCents: number;
  eventDate: ISODate;
  today: ISODate;
  manageUrl: string | null;
  appUrl: string;
  subscriptionId: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildReminderEmail(input: ReminderEmailInput) {
  const when = formatRelativeDays(daysBetween(input.today, input.eventDate));
  const date = formatDateLong(input.eventDate);
  const amount = formatPLN(input.amountCents);
  const detailsUrl = `${input.appUrl}/panel/subskrypcje/${input.subscriptionId}`;

  const subject =
    input.kind === "trial_end"
      ? `Okres próbny ${input.subscriptionName} kończy się ${when}`
      : `Płatność za ${input.subscriptionName} ${when}: ${amount}`;

  const lead =
    input.kind === "trial_end"
      ? `Okres próbny usługi ${input.subscriptionName} kończy się ${when} (${date}). Po jego zakończeniu dostawca może naliczyć opłatę ${amount}.`
      : `Usługa ${input.subscriptionName} pobierze opłatę ${amount} ${when} (${date}).`;

  const disclaimer =
    "SubAlert tylko przypomina — nie anuluje subskrypcji automatycznie. Jeśli nie chcesz płacić, anuluj usługę bezpośrednio u dostawcy.";

  const lines = [lead, "", disclaimer, ""];
  if (input.manageUrl) lines.push(`Zarządzaj subskrypcją: ${input.manageUrl}`);
  lines.push(`Szczegóły w SubAlert: ${detailsUrl}`);

  const manageLink = input.manageUrl
    ? `<p style="margin:0 0 12px"><a href="${escapeHtml(input.manageUrl)}" style="color:#4d7c0f">Zarządzaj subskrypcją u dostawcy</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="pl"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:18px">SubAlert</p>
<h1 style="margin:0 0 12px;font-size:20px">${escapeHtml(subject)}</h1>
<p style="margin:0 0 16px;line-height:1.5">${escapeHtml(lead)}</p>
<p style="margin:0 0 20px;padding:12px;background:#f7fee7;border-radius:8px;line-height:1.5;font-size:14px">${escapeHtml(disclaimer)}</p>
${manageLink}
<p style="margin:0"><a href="${escapeHtml(detailsUrl)}" style="color:#4d7c0f">Otwórz w SubAlert</a></p>
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#71717a">Przypomnienia możesz wyłączyć w ustawieniach konta SubAlert.</p>
</body></html>`;

  return { subject, html, text: lines.join("\n") };
}
