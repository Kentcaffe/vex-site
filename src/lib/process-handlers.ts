import { logger } from "@/lib/logger";

let registered = false;

/**
 * Înregistrare unică: prinde rejections/exceptions ca să nu oprească procesul fără log.
 * Pe Render, un crash necontrolat repornește dynoul — totuși vrem mesaje clare în log.
 */
export function registerProcessHandlers(): void {
  if (registered) {
    return;
  }
  registered = true;

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("process", "unhandledRejection", {
      err: reason instanceof Error ? reason : undefined,
      reason: reason instanceof Error ? undefined : String(reason),
    });
    // Nu apelăm process.exit — lăsăm runtime-ul să decidă; monitorizarea vede logul.
    void promise;
  });

  process.on("uncaughtException", (error, origin) => {
    logger.error("process", "uncaughtException", { err: error, origin });
    // uncaughtException poate lăsa procesul în stare instabilă — în producție unele echipe fac exit(1).
    // Pe Render, exit explicit declanșează restart curat. Folosim doar dacă e critic:
    if (process.env.EXIT_ON_UNCAUGHT === "true") {
      process.exit(1);
    }
  });
}
