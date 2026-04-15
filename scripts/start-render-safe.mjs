#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(label, command, args, env = process.env) {
  console.log(`[startup] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env,
  });
  return result.status ?? 1;
}

function inspectDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[startup] DATABASE_URL is missing. App will still boot in degraded mode.");
    return;
  }
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    console.warn("[startup] DATABASE_URL does not look like a PostgreSQL URL.");
    return;
  }
  try {
    const u = new URL(url);
    const host = u.hostname || "(unknown-host)";
    const isPooler = host.includes("pooler.supabase.com") || u.port === "6543";
    const isDirect = host.startsWith("db.") && host.endsWith(".supabase.co");
    console.log(`[startup] DATABASE_URL host=${host} port=${u.port || "5432"}`);
    if (isPooler) {
      console.log("[startup] Supabase pooler URL detected (good for app runtime).");
    } else if (isDirect) {
      console.warn(
        "[startup] Direct Supabase URL detected in DATABASE_URL. Consider using pooler URL for runtime and DIRECT_URL for migrations.",
      );
    }
  } catch {
    console.warn("[startup] DATABASE_URL cannot be parsed as a valid URL.");
  }
}

function maybeRunPrismaTasks() {
  if (process.env.PRISMA_SKIP_STARTUP_TASKS === "true") {
    console.warn("[startup] Skipping prisma startup tasks (PRISMA_SKIP_STARTUP_TASKS=true).");
    return;
  }

  const migrateStatus = run(
    "Running prisma migrate deploy (non-fatal on Render startup)",
    process.execPath,
    [path.join(root, "scripts", "prisma-migrate-deploy.mjs")],
    {
      ...process.env,
      PRISMA_MIGRATE_CONTINUE_ON_ERROR:
        process.env.PRISMA_MIGRATE_CONTINUE_ON_ERROR ?? "true",
    },
  );

  if (migrateStatus === 0) {
    console.log("[startup] Migrations completed.");
    return;
  }

  console.warn("[startup] Migrations failed. Continuing boot to keep web service alive.");

  if (process.env.PRISMA_DB_PUSH_FALLBACK === "false") {
    console.warn(
      "[startup] PRISMA_DB_PUSH_FALLBACK=false, skipping `prisma db push` fallback.",
    );
    return;
  }

  const dbPushStatus = run(
    "Running prisma db push fallback (best-effort)",
    process.execPath,
    [path.join(root, "node_modules", "prisma", "build", "index.js"), "db", "push", "--skip-generate"],
  );
  if (dbPushStatus !== 0) {
    console.warn("[startup] prisma db push fallback failed. Continuing boot anyway.");
  } else {
    console.log("[startup] prisma db push fallback succeeded.");
  }
}

function startNext() {
  const port = process.env.PORT;
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  const args = ["start", "-H", "0.0.0.0"];
  if (port) {
    args.push("-p", port);
  } else {
    console.warn("[startup] PORT is not set. Next.js default port will be used.");
  }

  const status = run("Starting Next.js server", process.execPath, [nextBin, ...args]);
  process.exit(status);
}

console.log("[startup] Boot sequence started.");
console.log(`[startup] NODE_ENV=${process.env.NODE_ENV || "(unset)"} RENDER=${process.env.RENDER || "false"}`);
inspectDatabaseUrl();
maybeRunPrismaTasks();
startNext();
