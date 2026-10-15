function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const STEPS = [
  {
    title: "Dodaj swoje stałe opłaty",
    text: "Subskrypcje i rachunki: Netflix, Spotify, prąd, internet, telefon. Z listy popularnych usług zajmie to chwilę.",
    label: "Dodaj opłaty",
    path: "/panel/start",
  },
  {
    title: "Włącz powiadomienia na telefonie",
    text: "Zainstaluj Opłacik na ekranie głównym telefonu, a przypomnienia przyjdą też jako powiadomienie, nie tylko e-mailem.",
    label: "Włącz powiadomienia",
    path: "/panel/ustawienia#aplikacja",
  },
  {
    title: "Dodaj terminy do kalendarza",
    text: "Wszystkie płatności pojawią się w kalendarzu Google, Apple albo Outlook i będą się same aktualizować.",
    label: "Podłącz kalendarz",
    path: "/panel/ustawienia#kalendarz",
  },
];

/** The one-off e-mail sent after an account is created. */
export function buildWelcomeEmail(appUrl: string) {
  const subject = "Witaj w Opłaciku: 3 kroki na dobry start";
  const intro = "Dzięki za założenie konta w Opłaciku. Żeby pilnował Twoich płatności, zrób te trzy rzeczy. Zajmą kilka minut.";
  const outro = "Masz pytanie albo coś nie działa? Odpowiedz na tę wiadomość, przeczytamy ją.";
  const footer = "Wysłaliśmy tę wiadomość jednorazowo po założeniu konta w Opłaciku.";

  const steps = STEPS.map(
    (step, index) => `<tr><td style="padding:0 0 18px;vertical-align:top;width:36px">
<div style="width:26px;height:26px;border-radius:13px;background:#c4f542;color:#0c1002;font-weight:bold;font-size:14px;line-height:26px;text-align:center">${index + 1}</div></td>
<td style="padding:0 0 18px;vertical-align:top"><p style="margin:2px 0 4px;font-weight:bold">${escapeHtml(step.title)}</p>
<p style="margin:0 0 6px;line-height:1.5;color:#3f3f46">${escapeHtml(step.text)}</p>
<a href="${escapeHtml(appUrl + step.path)}" style="color:#4d7c0f;font-weight:bold">${escapeHtml(step.label)} →</a></td></tr>`,
  ).join("\n");

  const html = `<!doctype html>
<html lang="pl"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:18px">Opłacik</p>
<h1 style="margin:0 0 12px;font-size:20px">Witaj w Opłaciku</h1>
<p style="margin:0 0 22px;line-height:1.5">${escapeHtml(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${steps}</table>
<p style="margin:6px 0 0;line-height:1.5;color:#3f3f46">${escapeHtml(outro)}</p>
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#71717a">${escapeHtml(footer)}</p>
</body></html>`;

  const text = [
    "Witaj w Opłaciku",
    "",
    intro,
    "",
    ...STEPS.flatMap((step, index) => [`${index + 1}. ${step.title}`, step.text, `${step.label}: ${appUrl}${step.path}`, ""]),
    outro,
    "",
    footer,
  ].join("\n");

  return { subject, html, text };
}
