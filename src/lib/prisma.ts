import fs from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

/** Asigură că folderul părinte al fișierului SQLite există (evită „directory does not exist”). */
function ensureSqliteParentDirExists(fileUrl: string): void {
  if (!fileUrl.startsWith("file:")) return;
  const rest = fileUrl.slice("file:".length);
  let absolute: string;
  if (rest.startsWith("/")) {
    // Unix: file:/var/data/vex.db (Render Persistent Disk)
    absolute = rest;
  } else if (/^[A-Za-z]:[\\/]/.test(rest)) {
    // Windows absolut: file:C:/data/db.sqlite
    absolute = rest;
  } else {
    const rel = rest.replace(/^\.\//, "");
    absolute = path.join(process.cwd(), rel);
  }
  const dir = path.dirname(absolute);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Tip explicit — evită pierderea inferenței pentru `include`/`select` când clientul e creat cu adapter. */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  ensureSqliteParentDirExists(url);
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Better concurrent reads while writing (SQLite); ignore if the driver rejects it.
void prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL;").catch(() => {});
