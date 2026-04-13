import { isSmtpConfigured } from "@/lib/email";

type SendResult = { ok: true } | { ok: false; error: string };

/** Poate trimite email tranzacțional: SMTP (Zoho) sau Resend. */
export function isMailConfigured(): boolean {
  const from = process.env.EMAIL_FROM;
  if (!from) return false;
  if (isSmtpConfigured()) return true;
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Trimite email prin API Resend. Necesită RESEND_API_KEY + EMAIL_FROM.
 */
export async function sendTransactionalEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    return { ok: false, error: "not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[mail] Resend error", res.status, text);
    return { ok: false, error: "send_failed" };
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(to: string, subject: string, html: string): Promise<SendResult> {
  return sendTransactionalEmail(to, subject, html);
}
