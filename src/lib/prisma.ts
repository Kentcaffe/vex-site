import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

type PrismaInstance = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaInstance | undefined };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Better concurrent reads while writing (SQLite); ignore if the driver rejects it.
void prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL;").catch(() => {});
