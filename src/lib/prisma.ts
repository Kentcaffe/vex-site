import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL lipsește. Setează connection string-ul PostgreSQL (ex. din Supabase: Project Settings → Database).",
    );
  }
  const dbUrl = process.env.DATABASE_URL;
  const sslRequested =
    process.env.DB_SSL === "true" || /sslmode=require/i.test(dbUrl);
  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "true";

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString: dbUrl,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      ...(sslRequested
        ? { ssl: { rejectUnauthorized } }
        : {}),
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
