import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isMaintenanceMode, isMiddlewareStaticBypass } from "@/lib/maintenance";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function attachSupabaseSession(request: NextRequest, response: NextResponse): Promise<void> {
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    return;
  }
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    await supabase.auth.getUser();
  } catch (err) {
    console.error("[proxy] Supabase session refresh failed:", err);
  }
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /* Chunk-uri, HMR, internals Vercel/Render — fără intl */
  if (pathname.startsWith("/_next") || pathname.startsWith("/_vercel")) {
    return NextResponse.next();
  }

  if (isMaintenanceMode()) {
    if (isMiddlewareStaticBypass(pathname)) {
      return NextResponse.next();
    }
    if (pathname === "/api/health") {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Service Unavailable",
          code: "MAINTENANCE",
          message: "Site under maintenance.",
        },
        { status: 503, headers: { "Retry-After": "120" } },
      );
    }
    if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) {
      const res = NextResponse.next();
      await attachSupabaseSession(request, res);
      return res;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    await attachSupabaseSession(request, response);
    return response;
  }

  // Keep /confirm outside locale middleware to prevent i18n rewrites/404.
  if (pathname === "/confirm" || pathname.startsWith("/confirm/")) {
    const response = NextResponse.next();
    await attachSupabaseSession(request, response);
    return response;
  }

  const response = await Promise.resolve(intlMiddleware(request));
  await attachSupabaseSession(request, response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Include /api pentru mentenanță; exclude asset-uri statice și fișiere publice cu extensie.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
