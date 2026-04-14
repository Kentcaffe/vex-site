import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

function maskConnectionHint(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username ? "***@" : ""}${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    return "(URL invalid)";
  }
}

function isDirectSupabaseHost(url) {
  try {
    const u = new URL(url);
    return (
      u.hostname.startsWith("db.") &&
      u.hostname.endsWith(".supabase.co") &&
      (u.port === "5432" || u.port === "")
    );
  } catch {
    return false;
  }
}

/** Pooler Supabase: host *.pooler.supabase.com (de obicei port 6543). */
function isSupabasePoolerUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("pooler.supabase.com")) return true;
    if (u.hostname.endsWith(".supabase.co") && u.port === "6543") return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Implicit: pooler (DATABASE_URL) înainte de DIRECT_URL — multe rețele (inclusiv unele către Render↔Supabase)
 * nu ajung la `db.*:5432` (P1001). Direct doar dacă setezi PRISMA_MIGRATE_TRY_DIRECT_FIRST=true.
 * Poolerul poate sta blocat la migrate; atunci oprești și rulezi migrate din alt mediu sau activezi direct.
 */
function buildMigrateUrlOrder() {
  const override = process.env.MIGRATE_DATABASE_URL;
  const pool = process.env.DATABASE_URL;
  const direct = process.env.DIRECT_URL;

  const tryDirectFirst =
    process.env.PRISMA_MIGRATE_TRY_DIRECT_FIRST === "true";

  const ordered = tryDirectFirst
    ? [override, direct, pool]
    : [override, pool, direct];

  return [...new Set(ordered.filter(Boolean))];
}

const unique = buildMigrateUrlOrder();

console.log(
  `[migrate] Env: DATABASE_URL=${process.env.DATABASE_URL ? "da" : "nu"}, DIRECT_URL=${process.env.DIRECT_URL ? "da" : "nu"}, MIGRATE_DATABASE_URL=${process.env.MIGRATE_DATABASE_URL ? "da" : "nu"}, RENDER=${process.env.RENDER === "true" ? "da" : "nu"}`,
);
const tryDirectFirst =
  process.env.PRISMA_MIGRATE_TRY_DIRECT_FIRST === "true";
console.log(
  `[migrate] Ordine: ${tryDirectFirst ? "override → DIRECT → DATABASE (pooler)" : "override → DATABASE (pooler) → DIRECT"}`,
);
console.log(`[migrate] URL-uri unice de încercat: ${unique.length}`);
unique.forEach((u, i) => console.log(`  ${i + 1}. ${maskConnectionHint(u)}`));

if (unique.length === 0) {
  console.error(
    "Lipsește DATABASE_URL. Pune în .env sau .env.local connection string-ul PostgreSQL (ex. din Supabase).",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL && process.env.DIRECT_URL) {
  console.warn(
    "[migrate] Ai DIRECT_URL dar nu DATABASE_URL. Adaugă și DATABASE_URL (de obicei pooler *.pooler.supabase.com:6543) — altfel migrarea folosește doar hostul direct, des inaccesibil de pe PC.",
  );
}

if (
  process.env.DATABASE_URL &&
  process.env.DIRECT_URL &&
  process.env.DATABASE_URL === process.env.DIRECT_URL
) {
  console.warn(
    "[migrate] DATABASE_URL și DIRECT_URL sunt identice. În Supabase sunt două stringuri diferite: «Connection pooling» (pooler, port 6543) pentru DATABASE_URL și «Direct» (db.*, port 5432) pentru DIRECT_URL.",
  );
}

if (
  process.env.DATABASE_URL &&
  isDirectSupabaseHost(process.env.DATABASE_URL) &&
  !isSupabasePoolerUrl(process.env.DATABASE_URL)
) {
  console.error("");
  console.error(
    "[migrate] ═══ DATABASE_URL pare a fi conexiunea DIRECTĂ (db.*.supabase.co:5432) ═══",
  );
  console.error(
    "[migrate] Aici trebuie «Connection pooling» din Supabase (host *.pooler.supabase.com, ex. port 6543).",
  );
  console.error(
    "[migrate] Tab «URI», meniul «Method: Connection pooling», apoi copiază stringul în DATABASE_URL.",
  );
  console.error(
    "[migrate] Stringul «Direct connection» lasă-l separat în DIRECT_URL.",
  );
  console.error("");
}

const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");

let lastStatus = 1;

for (let i = 0; i < unique.length; i++) {
  const url = unique[i];
  console.log(
    `[migrate] Încerc prisma migrate deploy (${i + 1}/${unique.length}) → ${maskConnectionHint(url)}`,
  );

  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
    cwd: root,
  });

  lastStatus = result.status ?? 1;
  if (lastStatus === 0) {
    process.exit(0);
  }

  if (i < unique.length - 1) {
    console.error(
      "[migrate] Eșuat cu acest URL; încerc următorul (ex. pooler vs direct)…",
    );
  }
}

if (lastStatus !== 0) {
  const onlyDirect =
    unique.length === 1 && unique[0] && isDirectSupabaseHost(unique[0]);
  console.error("");
  console.error(
    "[migrate] Dacă vezi P1001: de pe rețeaua ta, hostul direct db.*.supabase.co:5432 poate fi blocat.",
  );
  console.error(
    "[migrate] Soluții: (1) copiază din Supabase → Connection pooling → URI în DATABASE_URL în .env.local;",
  );
  console.error(
    "[migrate] (2) rulează migrarea din Render → Shell: npm run db:migrate:render;",
  );
  console.error(
    "[migrate] (3) Dacă s-a blocat mult la pooler (6543): `migrate deploy` + PgBouncer Transaction poate agăța; pe Render ordinea e direct primul (vezi log «Ordine»).",
  );
  if (onlyDirect) {
    console.error(
      "[migrate] Acum ai un singur URL (probabil doar direct). Adaugă DATABASE_URL cu pooler.",
    );
  }
}

process.exit(lastStatus);
