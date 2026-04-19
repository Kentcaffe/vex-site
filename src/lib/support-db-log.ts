import { Prisma } from "@prisma/client";

/** Răspuns JSON cu detalii eroare când `SUPPORT_API_DEBUG=1` (sau dev). Nu expune în producție fără acest flag. */
export function supportApiDebugEnabled(): boolean {
  const v = process.env.SUPPORT_API_DEBUG?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  if (v === "1" || v === "true" || v === "yes") return true;
  return process.env.NODE_ENV === "development";
}

export type SupportDbErrorPayload = {
  message: string;
  name?: string;
  prismaCode?: string;
  prismaMeta?: unknown;
};

let runtimeHintsLogged = false;

/** O dată: clarifică că suportul nu folosește service role pe Postgres (doar Storage). */
export function logSupportDataSourceHintsOnce(): void {
  if (runtimeHintsLogged) return;
  runtimeHintsLogged = true;
  const db = Boolean(process.env.DATABASE_URL?.trim());
  const service = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  console.info(
    "[support-db] Live support (SupportTicket / SupportMessage) folosește Prisma + DATABASE_URL către Postgres. Nu folosește SUPABASE_SERVICE_ROLE_KEY pentru aceste tabele — acel key e pentru Storage/API admin (vezi getSupabaseServiceClient).",
  );
  console.info(`[support-db] DATABASE_URL prezent: ${db}; SUPABASE_SERVICE_ROLE_KEY prezent: ${service}`);
}

/** Pentru răspuns JSON când SUPPORT_API_DEBUG e activ (fără a re-loga în route). */
export function serializeSupportDbError(e: unknown): SupportDbErrorPayload {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      name: "PrismaClientKnownRequestError",
      message: e.message,
      prismaCode: e.code,
      prismaMeta: e.meta,
    };
  }
  if (e instanceof Prisma.PrismaClientValidationError) {
    return { name: "PrismaClientValidationError", message: e.message };
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return {
      name: "PrismaClientInitializationError",
      message: e.message,
      prismaMeta: { errorCode: e.errorCode },
    };
  }
  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      prismaMeta: e.cause !== undefined ? { cause: String(e.cause) } : undefined,
    };
  }
  return { name: "non-Error", message: String(e) };
}

/**
 * Loghează eroarea completă în consola serverului (Render / local).
 * Pentru Prisma: `message`, `code` (ex. P2021 tabele lipsă), `meta`.
 */
export function logSupportDbFailure(context: string, e: unknown): SupportDbErrorPayload {
  logSupportDataSourceHintsOnce();
  const payload = serializeSupportDbError(e);
  console.error(`[support-db] ${context} — ${payload.name ?? "Error"}: ${payload.message}`);
  if (payload.prismaCode) {
    console.error(`[support-db] ${context} — prisma.code=${payload.prismaCode}`, payload.prismaMeta);
  }
  console.error(`[support-db] ${context} — payload JSON:`, JSON.stringify(payload));
  if (e instanceof Error && e.stack) {
    console.error(`[support-db] ${context} — stack:\n${e.stack}`);
  }
  return payload;
}
