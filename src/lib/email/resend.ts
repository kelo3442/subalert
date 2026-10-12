import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Provider-side deduplication key; retries with the same key send once. */
  idempotencyKey: string;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export interface EmailConfig {
  apiKey: string;
  from: string;
}

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

/** Sends an e-mail through the Resend HTTP API (https://resend.com/docs/api-reference). */
export async function sendEmail(config: EmailConfig, message: EmailMessage): Promise<SendResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok || !body.id) {
      return { ok: false, error: `Resend ${response.status}: ${body.message ?? "unknown error"}` };
    }
    return { ok: true, id: body.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "network error" };
  }
}
