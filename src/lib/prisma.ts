import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

/** Tip explicit — evită pierderea inferenței pentru `include`/`select` când clientul e creat cu adapter. */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
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
