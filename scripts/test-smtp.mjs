/**
 * Test conexiune SMTP (Zoho etc.):  node scripts/test-smtp.mjs
 * Nu trimite email; doar verifică login la serverul SMTP.
 */
import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER?.trim();
const pass = (process.env.SMTP_PASS ?? "").trim();

if (!host || !user || !pass) {
  console.error("Lipsește SMTP_HOST / SMTP_USER / SMTP_PASS în .env");
  process.exit(1);
}

const explicit = process.env.SMTP_SECURE;
const secure =
  explicit === "true" ? true : explicit === "false" ? false : port === 465;

const authMethod = process.env.SMTP_AUTH_METHOD === "PLAIN" ? "PLAIN" : "LOGIN";
const smtpDebug = process.env.SMTP_DEBUG === "1" || process.env.SMTP_DEBUG === "true";

const t = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  authMethod,
  ...(!secure ? { requireTLS: true } : {}),
  tls: { minVersion: "TLSv1.2", servername: host },
  logger: smtpDebug,
  debug: smtpDebug,
});

try {
  await t.verify();
  console.log("OK: serverul SMTP acceptă autentificarea (verify).");
} catch (e) {
  console.error("Eșec verify SMTP:", e instanceof Error ? e.message : e);
  console.error(
    "Încearcă: smtppro.zoho.eu, port 587 + SMTP_SECURE=false, parolă nouă din Zoho (fără spații), sau SMTP_DEBUG=1 pentru log brut.",
  );
  console.error(
    "Dacă Zoho tot refuză: folosește Resend (RESEND_API_KEY + EMAIL_FROM) — vezi .env.example.",
  );
  process.exit(1);
}
