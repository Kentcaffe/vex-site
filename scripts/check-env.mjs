#!/usr/bin/env node
/**
 * Verifică variabile de mediu fără a afișa valori secrete.
 * Rulare: node scripts/check-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function loadDotEnv() {
  if (!existsSync(envPath)) {
    console.error("Lipsește fișierul .env — copiază din .env.example:  cp .env.example .env");
    process.exit(1);
  }
  const raw = readFileSync(envPath, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadDotEnv();

function ok(name) {
  const v = env[name];
  return typeof v === "string" && v.length > 0;
}

const issues = [];

if (!ok("AUTH_SECRET") || env.AUTH_SECRET.includes("generate-with-openssl")) {
  issues.push("AUTH_SECRET: setează un secret real (openssl rand -base64 32), nu placeholder-ul din exemplu.");
}

const smtpReady =
  ok("SMTP_HOST") && ok("SMTP_USER") && ok("SMTP_PASS") && ok("EMAIL_FROM");
const resendReady = ok("RESEND_API_KEY") && ok("EMAIL_FROM");

if (!smtpReady && !resendReady) {
  issues.push(
    'Email / resetare parolă: completează fie (SMTP_HOST + SMTP_USER + SMTP_PASS + EMAIL_FROM), fie (RESEND_API_KEY + EMAIL_FROM).',
  );
}

if (!ok("NEXT_PUBLIC_APP_URL")) {
  issues.push("NEXT_PUBLIC_APP_URL: recomandat (ex. http://localhost:3000 sau https://vex.md).");
}

if (!ok("DATABASE_URL")) {
  issues.push(
    "DATABASE_URL: obligatoriu — connection string PostgreSQL (ex. din Supabase → Project Settings → Database → URI).",
  );
} else if (!/^postgres(ql)?:\/\//i.test(env.DATABASE_URL)) {
  issues.push(
    "DATABASE_URL: trebuie să înceapă cu postgresql:// sau postgres:// (baza e migrată de la SQLite la PostgreSQL).",
  );
}

if (issues.length) {
  console.error("--- Verificare .env: de rezolvat ---\n");
  for (const m of issues) console.error("• " + m);
  console.error("\nFișier verificat:", envPath);
  process.exit(1);
}

console.log("OK: variabile critice par setate (fără a afișa valori).");
console.log("Fișier:", envPath);
process.exit(0);
