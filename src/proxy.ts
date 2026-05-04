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
import {
  canBypassMaintenanceWithSessionUser,
  refreshSupabaseSession,
  userMustChangePasswordFromSession,
} from "./lib/proxy-auth";
import { stripLocalePrefix } from "./lib/i18n-path";
import { routing } from "./i18n/routing";

/**
 * Edge middleware (Next.js 16: fișierul se numește `proxy.ts`).
 * Mentenanță + i18n + Supabase session refresh + redirect schimbare parolă obligatorie.
 */
const intlMiddleware = createMiddleware(routing);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function attachSupabaseSession(request: NextRequest, response: NextResponse): Promise<void> {
  await refreshSupabaseSession(request, response);
}

/** Rute accesibile fără login în timpul mentenanței (login, health, confirm). */
function isMaintenancePublicPath(basePath: string): boolean {
  if (basePath === "/maintenance" || basePath.startsWith("/maintenance/")) return true;
  if (basePath === "/login" || basePath.startsWith("/login/")) return true;
  if (basePath === "/change-password") return true;
  if (basePath === "/confirm" || basePath.startsWith("/confirm/")) return true;
  for (const loc of routing.locales) {
    if (basePath === `/${loc}/login` || basePath.startsWith(`/${loc}/login/`)) return true;
    if (basePath === `/${loc}/change-password` || basePath.startsWith(`/${loc}/change-password/`)) return true;
    if (basePath === `/${loc}/confirm` || basePath.startsWith(`/${loc}/confirm/`)) return true;
  }
  return false;
}

function isAuthApiPath(pathname: string): boolean {
  return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
}

function changePasswordRedirectUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;
  for (const loc of routing.locales) {
    if (loc === routing.defaultLocale) continue;
    const prefix = `/${loc}`;
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      url.pathname = `${prefix}/change-password`;
      return url;
    }
  }
  url.pathname = "/change-password";
  return url;
}

function mustChangePasswordExemptBasePath(basePath: string): boolean {
  if (basePath === "/change-password") return true;
  if (basePath === "/login" || basePath.startsWith("/login/")) return true;
  if (basePath === "/confirm" || basePath.startsWith("/confirm/")) return true;
  if (basePath === "/maintenance" || basePath.startsWith("/maintenance/")) return true;
  for (const loc of routing.locales) {
    if (basePath === `/${loc}/login` || basePath.startsWith(`/${loc}/login/`)) return true;
    if (basePath === `/${loc}/change-password` || basePath.startsWith(`/${loc}/change-password/`)) return true;
    if (basePath === `/${loc}/confirm` || basePath.startsWith(`/${loc}/confirm/`)) return true;
    if (basePath === `/${loc}/maintenance` || basePath.startsWith(`/${loc}/maintenance/`)) return true;
  }
  return false;
}

/**
 * Pagina de mentenanță e în `app/maintenance`, nu în `app/[locale]/…`.
 * next-intl rescrie `/maintenance` către `/ro/maintenance` → Next caută `[locale]/maintenance` → 404.
 */
function isMaintenancePagePath(pathname: string): boolean {
  if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) return true;
  const base = stripLocalePrefix(pathname);
  if (base === "/maintenance" || base.startsWith("/maintenance/")) return true;
  const dl = routing.defaultLocale;
  if (pathname === `/${dl}/maintenance` || pathname.startsWith(`/${dl}/maintenance/`)) return true;
  return false;
}

export default async function proxy(request: NextRequest) {
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

    if (isMaintenancePagePath(pathname)) {
      if (pathname !== "/maintenance" && !pathname.startsWith("/maintenance/")) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        url.search = "";
        return NextResponse.redirect(url, 307);
      }
      const response = NextResponse.next();
      await attachSupabaseSession(request, response);
      return response;
    }

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
      if (isAuthApiPath(pathname)) {
        const response = NextResponse.next();
        await attachSupabaseSession(request, response);
        return response;
      }
      const response = NextResponse.next();
      const user = await refreshSupabaseSession(request, response);
      if (user && canBypassMaintenanceWithSessionUser(user)) {
        return response;
      }
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

    const response = await Promise.resolve(intlMiddleware(request));
    const user = await refreshSupabaseSession(request, response);
    const basePath = stripLocalePrefix(pathname);

    if (isMaintenancePublicPath(basePath)) {
      return response;
    }

    if (user && canBypassMaintenanceWithSessionUser(user)) {
      return response;
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
  const user = await refreshSupabaseSession(request, response);
  const basePath = stripLocalePrefix(pathname);

  if (
    user &&
    userMustChangePasswordFromSession(user) &&
    !mustChangePasswordExemptBasePath(basePath) &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(changePasswordRedirectUrl(request), 307);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
