import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isBetaAccessApiPath,
  isMaintenanceMode,
  isMiddlewareStaticBypass,
  isValidMaintenanceBypassCookie,
  MAINTENANCE_BYPASS_COOKIE,
} from "./lib/maintenance";
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
    console.error("[middleware] Supabase session refresh failed:", err);
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname.startsWith("/_vercel")) {
    return NextResponse.next();
  }

  const bypassCookie = request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value;
  const hasMaintenanceBypass = await isValidMaintenanceBypassCookie(bypassCookie);

  if (isMaintenanceMode()) {
    if (isMiddlewareStaticBypass(pathname)) {
      return NextResponse.next();
    }

    /** Utilizatori cu cookie valid: acces complet (inclusiv API + rute localizate). */
    if (hasMaintenanceBypass) {
      if (pathname.startsWith("/api/")) {
        const response = NextResponse.next();
        await attachSupabaseSession(request, response);
        return response;
      }
      if (pathname === "/confirm" || pathname.startsWith("/confirm/")) {
        const response = NextResponse.next();
        await attachSupabaseSession(request, response);
        return response;
      }
      const response = await Promise.resolve(intlMiddleware(request));
      await attachSupabaseSession(request, response);
      return response;
    }

    if (pathname === "/api/health") {
      return NextResponse.next();
    }

    if (isBetaAccessApiPath(pathname)) {
      const response = NextResponse.next();
      await attachSupabaseSession(request, response);
      return response;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
