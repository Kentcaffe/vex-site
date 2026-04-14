import "dotenv/config";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Folosește DIRECT_URL dacă există (recomandat pentru Supabase la migrate), altfel DATABASE_URL. */
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error(
    "Lipsește DATABASE_URL (sau DIRECT_URL pentru migrări). Setează în .env / Render Environment.",
  );
  process.exit(1);
}

const root = path.dirname(fileURLToPath(import.meta.url));
const prismaCli = path.join(root, "..", "node_modules", "prisma", "build", "index.js");

const result = spawnSync(
  process.execPath,
  [prismaCli, "migrate", "deploy"],
  {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
    cwd: path.join(root, ".."),
  },
);

process.exit(result.status ?? 1);
