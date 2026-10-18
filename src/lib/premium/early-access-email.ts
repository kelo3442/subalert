import { EARLY_ACCESS_MONTHS } from "./plan";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** The gift box with the claim button, shared by the welcome e-mail and the "send again" e-mail. */
export function earlyAccessClaimBlock(claimUrl: string) {
  const text = `Prezent na start: pierwsze 100 kont dostaje Premium za darmo na ${EARLY_ACCESS_MONTHS} miesięcy — bez limitu opłat i z automatycznym czytaniem maili. Kliknij przycisk, żeby potwierdzić swój adres e-mail i odebrać Premium. Potem konto wróci do darmowego planu, nic nie zapłacisz.`;
  const label = "Odbierz darmowe Premium";
  const html = `<div style="margin:0 0 22px;padding:14px 16px;background:#f7fee7;border-radius:10px;line-height:1.5">
<p style="margin:0 0 12px">🎁 ${escapeHtml(text)}</p>
<a href="${escapeHtml(claimUrl)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#c4f542;color:#0c1002;font-weight:bold;text-decoration:none">${label}</a>
</div>`;
  return { html, text: `${text}\n${label}: ${claimUrl}` };
}

/** Sent when someone asks for the claim link again. */
export function buildEarlyAccessEmail(claimUrl: string, placesLeft: number) {
  const subject = "Odbierz darmowe Premium w Opłaciku";
  const block = earlyAccessClaimBlock(claimUrl);
  const places = `Zostało jeszcze ${placesLeft} z 100 miejsc.`;
  const footer = "Wysłaliśmy tę wiadomość, bo poprosiłeś(-aś) o link w Opłaciku. Jeśli to nie Ty, zignoruj ją.";
  const html = `<!doctype html>
<html lang="pl"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0 0 20px;font-weight:bold;font-size:18px">Opłacik</p>
<h1 style="margin:0 0 12px;font-size:20px">${subject}</h1>
${block.html}
<p style="margin:0;line-height:1.5;color:#3f3f46">${escapeHtml(places)}</p>
</div>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#71717a">${escapeHtml(footer)}</p>
</body></html>`;
  const text = [subject, "", block.text, "", places, "", footer].join("\n");
  return { subject, html, text };
}
