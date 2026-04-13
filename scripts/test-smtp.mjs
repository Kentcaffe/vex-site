/**
 * Test conexiune SMTP (Zoho etc.):  node scripts/test-smtp.mjs
 * Nu trimite email; doar verifică login la serverul SMTP.
 */
import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (!host || !user || !pass) {
  console.error("Lipsește SMTP_HOST / SMTP_USER / SMTP_PASS în .env");
  process.exit(1);
}

const explicit = process.env.SMTP_SECURE;
const secure =
  explicit === "true" ? true : explicit === "false" ? false : port === 465;

const t = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  ...(!secure ? { requireTLS: true } : {}),
  tls: { minVersion: "TLSv1.2" },
});

try {
  await t.verify();
  console.log("OK: serverul SMTP acceptă autentificarea (verify).");
} catch (e) {
  console.error("Eșec verify SMTP:", e instanceof Error ? e.message : e);
  console.error("Încearcă: alt SMTP_HOST (ex. smtppro.zoho.eu), port 587 + SMTP_SECURE=false, sau parolă de aplicație Zoho.");
  process.exit(1);
}
