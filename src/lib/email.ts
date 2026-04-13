import nodemailer from "nodemailer";
import { localizedHref } from "@/lib/paths";
import { routing } from "@/i18n/routing";

let transporter: nodemailer.Transporter | null | undefined;

function getTransport(): nodemailer.Transporter | null {
  if (transporter === null) return null;
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
  });
  return transporter;
}

/** True dacă SMTP (ex. Zoho) + expeditor sunt setate. */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM,
  );
}

/** URL absolut pentru butonul din email: `/reset?token=` (locale implicit) sau cale localizată. */
export function buildPasswordResetAbsoluteUrl(token: string, locale: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vex.md").replace(/\/$/, "");
  if (locale === routing.defaultLocale) {
    return `${base}/reset?token=${encodeURIComponent(token)}`;
  }
  const path = localizedHref(locale, "/cont/reset-password");
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

const COPY: Record<
  string,
  {
    title: string;
    lead: string;
    button: string;
    validity: string;
    footer: string;
    signature: string;
  }
> = {
  ro: {
    title: "Resetare parolă",
    lead: "Am primit o cerere de resetare a parolei pentru contul tău VEX.",
    button: "Resetează parola",
    validity: "Acest link este valabil timp de 1 oră.",
    footer: "Dacă nu ai cerut resetarea, poți ignora acest email.",
    signature: "Echipa VEX",
  },
  en: {
    title: "Reset your password",
    lead: "We received a request to reset the password for your VEX account.",
    button: "Reset password",
    validity: "This link is valid for 1 hour.",
    footer: "If you did not request a reset, you can ignore this email.",
    signature: "The VEX team",
  },
  ru: {
    title: "Сброс пароля",
    lead: "Мы получили запрос на сброс пароля для вашей учётной записи VEX.",
    button: "Сбросить пароль",
    validity: "Ссылка действительна в течение 1 часа.",
    footer: "Если вы не запрашивали сброс, проигнорируйте это письмо.",
    signature: "Команда VEX",
  },
};

function copyFor(locale: string) {
  return COPY[locale] ?? COPY.ro;
}

export function getPasswordResetSubject(locale: string): string {
  if (locale === "en") return "Reset your password — VEX";
  if (locale === "ru") return "Сброс пароля VEX";
  return "Resetare parolă VEX";
}

/**
 * HTML responsive, compatibil cu clienți de email (tabele + stiluri inline).
 */
export function buildPasswordResetEmailHtml(token: string, locale: string): string {
  const link = buildPasswordResetAbsoluteUrl(token, locale);
  const c = copyFor(locale);

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(c.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:500px;background:#ffffff;border-radius:12px;box-shadow:0 10px 40px rgba(15,23,42,0.08);overflow:hidden;">
          <tr>
            <td style="padding:36px 32px 28px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                ${escapeHtml(c.title)}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#52525b;">
                ${escapeHtml(c.lead)}
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                <tr>
                  <td style="border-radius:8px;background:#16a34a;">
                    <a href="${escapeAttr(link)}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;line-height:1.4;">
                      ${escapeHtml(c.button)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#71717a;">
                ${escapeHtml(c.validity)}
              </p>
              <p style="margin:0 0 28px;font-size:12px;line-height:1.5;color:#a1a1aa;word-break:break-all;">
                <a href="${escapeAttr(link)}" style="color:#16a34a;text-decoration:none;">${escapeHtml(link)}</a>
              </p>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#71717a;">
                ${escapeHtml(c.footer)}
              </p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#18181b;">
                ${escapeHtml(c.signature)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Trimite mesajul de resetare parolă prin SMTP (ex. Zoho).
 * Folosește HTML profesional + subiect fix conform brandului.
 */
export async function sendResetEmail(
  email: string,
  token: string,
  locale: string = "ro",
): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "smtp_not_configured" };
  }

  const transport = getTransport();
  if (!transport) {
    return { ok: false, error: "no_transport" };
  }

  const html = buildPasswordResetEmailHtml(token, locale);
  const subject = getPasswordResetSubject(locale);
  const from = process.env.EMAIL_FROM;

  try {
    await transport.sendMail({
      from: from!,
      to: email,
      subject,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[email] SMTP send failed:", err);
    return { ok: false, error: "send_failed" };
  }
}

/** Trimite un HTML oarecare prin SMTP (același transport). */
export async function sendHtmlViaSmtp(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "smtp_not_configured" };
  }
  const transport = getTransport();
  if (!transport) {
    return { ok: false, error: "no_transport" };
  }
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[email] SMTP send failed:", err);
    return { ok: false, error: "send_failed" };
  }
}
