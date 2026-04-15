import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  prismaInitError: string | undefined;
};

/** pg nu citește mereu sslmode din URL la fel ca libpq; pentru host remote trebuie ssl explicit. */
function poolSslForUrl(dbUrl: string):
  | undefined
  | false
  | { rejectUnauthorized: boolean } {
  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "true";

  if (process.env.DB_SSL === "false") {
    return undefined;
  }

  let host = "";
  try {
    const normalized = dbUrl.replace(/^postgres(ql)?:\/\//i, "http://");
    host = new URL(normalized).hostname;
  } catch {
    host = "";
  }

  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local");

  const urlImpliesTls =
    /sslmode=(require|verify-full|verify-ca)/i.test(dbUrl) ||
    /[?&]ssl=true/i.test(dbUrl);

  if (isLocal && !urlImpliesTls && process.env.DB_SSL !== "true") {
    return undefined;
  }

  if (!isLocal || process.env.DB_SSL === "true" || urlImpliesTls) {
    return { rejectUnauthorized };
  }

  return undefined;
}

/**
 * pg v8+ tratează sslmode=require din URL ca verify-full (vezi warning în logs).
 * Dacă setăm `ssl: { rejectUnauthorized }` pe Pool, trebuie scoși parametrii SSL din URL,
 * altfel TLS rămâne strict și pică cu "self-signed certificate in certificate chain".
 */
function connectionStringWithoutSslQuery(dbUrl: string): string {
  try {
    const u = new URL(dbUrl);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    u.searchParams.delete("sslrootcert");
    u.searchParams.delete("sslcert");
    u.searchParams.delete("sslkey");
    return u.toString();
  } catch {
    return dbUrl;
  }
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is missing. Database features are unavailable.");
  }
  if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
    throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
  }
  const ssl = poolSslForUrl(dbUrl);
  const connectionString =
    ssl !== undefined
      ? connectionStringWithoutSslQuery(dbUrl)
      : dbUrl;

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      ...(ssl !== undefined ? { ssl } : {}),
    });
  globalForPrisma.pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function createUnavailablePrismaClient(message: string): PrismaClient {
  const error = new Error(
    `[prisma] Database client unavailable: ${message}. App boot continues, but DB-backed features will fail until DATABASE_URL/migrations are fixed.`,
  );
  const delegateTarget = () => undefined;
  const delegateProxy = new Proxy(delegateTarget, {
    get() {
      return delegateProxy;
    },
    apply() {
      throw error;
    },
  });
  return new Proxy(delegateProxy as unknown as PrismaClient, {
    get() {
      return delegateProxy;
    },
  });
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  try {
    const client = createPrismaClient();
    globalForPrisma.prisma = client;
    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    globalForPrisma.prismaInitError = message;
    console.error(`[prisma] Startup fallback enabled: ${message}`);
    const unavailable = createUnavailablePrismaClient(message);
    globalForPrisma.prisma = unavailable;
    return unavailable;
  }
}

export const prisma = getPrismaClient();
