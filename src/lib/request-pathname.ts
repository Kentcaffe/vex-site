import type { NextRequest } from "next/server";
import { headers } from "next/headers";

export const PATHNAME_HEADER = "x-pathname";

/** Pentru middleware/proxy — propagă pathname-ul curent către generateMetadata. */
export function attachPathnameHeader(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATHNAME_HEADER, request.nextUrl.pathname);
  return requestHeaders;
}

/** Citește pathname-ul setat de proxy; fallback `/` dacă lipsește. */
export async function currentRequestPathname(): Promise<string> {
  const headersList = await headers();
  return headersList.get(PATHNAME_HEADER) ?? "/";
}
