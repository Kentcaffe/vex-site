/**
 * Mapare erori Prisma / comune DB → răspuns sigur pentru API.
 * Nu expunem mesaje interne Postgres.
 */

const PRISMA_UNAVAILABLE = new Set([
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1017",
]);

export function isPrismaConnectionError(code: string | undefined): boolean {
  if (!code) {
    return false;
  }
  return PRISMA_UNAVAILABLE.has(code);
}

export function friendlyMessageForDatabase(): string {
  return "The database is temporarily unavailable. Please try again in a few minutes.";
}
