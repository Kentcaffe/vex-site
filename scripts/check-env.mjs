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
const warnings = [];

if (!ok("NEXT_PUBLIC_SUPABASE_URL")) {
  issues.push("NEXT_PUBLIC_SUPABASE_URL: obligatoriu pentru Supabase Auth.");
}
if (!ok("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
  issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY: obligatoriu pentru Supabase Auth.");
}
if (!ok("SUPABASE_SERVICE_ROLE_KEY")) {
  warnings.push(
    "SUPABASE_SERVICE_ROLE_KEY lipsește. Nu este necesar pentru login basic client, dar e recomandat pentru operații server-side administrative.",
  );
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
  issues.push("NEXT_PUBLIC_APP_URL: recomandat (ex. https://vex.md).");
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

if (!ok("AUTH_URL")) {
  warnings.push("AUTH_URL lipsește. În producție setează AUTH_URL=https://vex.md pentru callback-uri corecte.");
}

if (ok("DATABASE_URL")) {
  try {
    const u = new URL(env.DATABASE_URL);
    const host = u.hostname;
    const isPooler =
      host.includes("pooler.supabase.com") || u.port === "6543";
    const isDirectSupabase =
      host.startsWith("db.") && host.endsWith(".supabase.co");

    if (isDirectSupabase && !isPooler) {
      warnings.push(
        "DATABASE_URL pare direct (db.*.supabase.co:5432). Pentru runtime pe Render e recomandat pooler-ul Supabase (de obicei :6543).",
      );
    }
    if (!ok("DIRECT_URL")) {
      warnings.push(
        "DIRECT_URL lipsește (opțional, dar recomandat pentru migrate fallback când pooler-ul nu permite migrate).",
      );
    } else if (env.DIRECT_URL === env.DATABASE_URL) {
      warnings.push(
        "DIRECT_URL este identic cu DATABASE_URL. În Supabase folosește URL-uri diferite: pooler pentru DATABASE_URL, direct pentru DIRECT_URL.",
      );
    }
  } catch {
    warnings.push("DATABASE_URL nu poate fi parse-at ca URL valid.");
  }
}

if (issues.length) {
  console.error("--- Verificare .env: de rezolvat ---\n");
  for (const m of issues) console.error("• " + m);
  console.error("\nFișier verificat:", envPath);
  process.exit(1);
}

console.log("OK: variabile critice par setate (fără a afișa valori).");
if (warnings.length) {
  console.warn("\n--- Verificare .env: recomandări ---\n");
  for (const m of warnings) console.warn("• " + m);
}
console.log("Fișier:", envPath);
process.exit(0);
