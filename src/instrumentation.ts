/**
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 * Rulează la pornirea serverului Node (nu pe Edge).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerProcessHandlers } = await import("@/lib/process-handlers");
    registerProcessHandlers();
  }
}
