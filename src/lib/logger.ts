/**
 * Logger structurat pentru producție (Render → log stream).
 * Păstrează console în dev; în producție poți extinde cu servicii externe.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogPayload = Record<string, unknown>;

const isDev = process.env.NODE_ENV !== "production";

function ts(): string {
  return new Date().toISOString();
}

function serialize(payload: LogPayload | undefined): string {
  if (!payload || Object.keys(payload).length === 0) {
    return "";
  }
  try {
    return ` ${JSON.stringify(payload)}`;
  } catch {
    return " [payload serialize failed]";
  }
}

export const logger = {
  debug(scope: string, message: string, payload?: LogPayload) {
    if (!isDev) {
      return;
    }
    console.debug(`[${ts()}] [DEBUG] [${scope}] ${message}${serialize(payload)}`);
  },

  info(scope: string, message: string, payload?: LogPayload) {
    console.info(`[${ts()}] [INFO] [${scope}] ${message}${serialize(payload)}`);
  },

  warn(scope: string, message: string, payload?: LogPayload) {
    console.warn(`[${ts()}] [WARN] [${scope}] ${message}${serialize(payload)}`);
  },

  error(scope: string, message: string, payload?: LogPayload & { err?: unknown }) {
    const { err, ...rest } = payload ?? {};
    const errPart =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err !== undefined
          ? { value: String(err) }
          : {};
    console.error(
      `[${ts()}] [ERROR] [${scope}] ${message}${serialize({ ...rest, ...errPart } as LogPayload)}`,
    );
  },
};
