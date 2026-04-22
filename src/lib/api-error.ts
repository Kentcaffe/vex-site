import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/** Coduri stabile pentru client (afișare user-friendly, fără stack). */
export const ApiErrorCode = {
  MAINTENANCE: "MAINTENANCE",
  INTERNAL: "INTERNAL_ERROR",
  DATABASE: "DATABASE_UNAVAILABLE",
  VALIDATION: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  RATE_LIMIT: "RATE_LIMIT",
} as const;

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export function jsonMaintenance(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: "Service Unavailable",
      code: ApiErrorCode.MAINTENANCE,
      message: "The site is under maintenance. Please try again later.",
    },
    { status: 503, headers: { "Retry-After": "120" } },
  );
}

export function jsonServiceUnavailable(
  message = "Service temporarily unavailable",
  code: ApiErrorCodeType = ApiErrorCode.DATABASE,
): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: "Service Unavailable",
      code,
      message,
    },
    { status: 503, headers: { "Retry-After": "60" } },
  );
}

export function jsonInternalError(
  publicMessage = "Something went wrong. Please try again.",
  logContext?: { scope: string; cause?: unknown },
): NextResponse {
  if (logContext) {
    logger.error(logContext.scope, "jsonInternalError", { err: logContext.cause });
  }
  return NextResponse.json(
    {
      ok: false,
      error: "Internal Server Error",
      code: ApiErrorCode.INTERNAL,
      message: publicMessage,
    },
    { status: 500 },
  );
}

type RouteCtx = { request: Request };

/**
 * Wrapper pentru route handlers: prinde erori și răspunde JSON (fără crash necontrolat).
 */
export function safeApiRoute(
  scope: string,
  handler: (ctx: RouteCtx, ...args: unknown[]) => Promise<NextResponse>,
): (request: Request, ...args: unknown[]) => Promise<NextResponse> {
  return async (request: Request, ...args: unknown[]) => {
    try {
      return await handler({ request }, ...args);
    } catch (cause) {
      logger.error(scope, "route handler failed", { err: cause });
      return jsonInternalError("An unexpected error occurred. Please try again.", { scope, cause });
    }
  };
}
