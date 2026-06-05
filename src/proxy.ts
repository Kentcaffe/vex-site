import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  isBetaAccessApiPath,
  isMaintenanceMode,
  isMiddlewareStaticBypass,
  isValidMaintenanceBypassCookie,
  MAINTENANCE_BYPASS_COOKIE,
} from "./lib/maintenance";
import {
  isMandatoryPasswordChangeAllowedApi,
  isMandatoryPasswordChangePageExempt,
} from "./lib/must-change-password-paths";
import {
  canBypassMaintenanceWithSessionUser,
  refreshSupabaseSession,
  userMustChangePasswordFromSession,
} from "./lib/proxy-auth";
import { stripLocalePrefix } from "./lib/i18n-path";
import { attachPathnameHeader } from "./lib/request-pathname";
import { routing } from "./i18n/routing";

/**
 * Edge middleware (Next.js 16: fișierul se numește `proxy.ts`, echivalent `middleware.ts`).
 * Mentenanță + i18n + Supabase session + redirect strict când `must_change_password` în metadata.
 * Flag-ul e sincronizat din Prisma în `user_metadata` (Edge nu poate folosi Prisma direct).
 */
const intlMiddleware = createMiddleware(routing);

async function attachSupabaseSession(request: NextRequest, response: NextResponse): Promise<void> {
  await refreshSupabaseSession(request, response);
}

function nextWithPathname(request: NextRequest, init?: ResponseInit): NextResponse {
  return NextResponse.next({
    ...init,
    request: { headers: attachPathnameHeader(request) },
  });
}

function intlWithPathname(request: NextRequest): NextResponse | Promise<NextResponse> {
  const headers = attachPathnameHeader(request);
  const req = new NextRequest(request.url, { headers });
  return intlMiddleware(req);
}

function jsonMustChangePassword(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "must_change_password", code: "MUST_CHANGE_PASSWORD" },
    { status: 403 },
  );
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
    return nextWithPathname(request);
  }

  const bypassCookie = request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value;
  const hasMaintenanceBypass = await isValidMaintenanceBypassCookie(bypassCookie);

  if (isMaintenanceMode()) {
    if (isMiddlewareStaticBypass(pathname)) {
      return nextWithPathname(request);
    }

    if (isMaintenancePagePath(pathname)) {
      if (pathname !== "/maintenance" && !pathname.startsWith("/maintenance/")) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        url.search = "";
        return NextResponse.redirect(url, 307);
      }
      const response = nextWithPathname(request);
      await attachSupabaseSession(request, response);
      return response;
    }

    if (hasMaintenanceBypass) {
      if (pathname.startsWith("/api/")) {
        const response = nextWithPathname(request);
        const user = await refreshSupabaseSession(request, response);
        if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangeAllowedApi(request)) {
          return jsonMustChangePassword();
        }
        return response;
      }
      if (pathname === "/confirm" || pathname.startsWith("/confirm/")) {
        const response = nextWithPathname(request);
        await attachSupabaseSession(request, response);
        return response;
      }
      const response = await Promise.resolve(intlWithPathname(request));
      const user = await refreshSupabaseSession(request, response);
      const basePath = stripLocalePrefix(pathname);
      if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangePageExempt(basePath)) {
        return NextResponse.redirect(changePasswordRedirectUrl(request), 307);
      }
      return response;
    }

    if (pathname === "/api/health") {
      return nextWithPathname(request);
    }

    if (isBetaAccessApiPath(pathname)) {
      const response = nextWithPathname(request);
      await attachSupabaseSession(request, response);
      return response;
    }

    if (pathname.startsWith("/api/")) {
      if (isAuthApiPath(pathname)) {
        const response = nextWithPathname(request);
        const user = await refreshSupabaseSession(request, response);
        if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangeAllowedApi(request)) {
          return jsonMustChangePassword();
        }
        return response;
      }
      const response = nextWithPathname(request);
      const user = await refreshSupabaseSession(request, response);
      if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangeAllowedApi(request)) {
        return jsonMustChangePassword();
      }
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

    const response = await Promise.resolve(intlWithPathname(request));
    const user = await refreshSupabaseSession(request, response);
    const basePath = stripLocalePrefix(pathname);

    if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangePageExempt(basePath)) {
      return NextResponse.redirect(changePasswordRedirectUrl(request), 307);
    }

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
    const response = nextWithPathname(request);
    const user = await refreshSupabaseSession(request, response);
    if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangeAllowedApi(request)) {
      return jsonMustChangePassword();
    }
    return response;
  }

  if (pathname === "/confirm" || pathname.startsWith("/confirm/")) {
    const response = nextWithPathname(request);
    await attachSupabaseSession(request, response);
    return response;
  }

  const response = await Promise.resolve(intlWithPathname(request));
  const user = await refreshSupabaseSession(request, response);
  const basePath = stripLocalePrefix(pathname);

  if (user && userMustChangePasswordFromSession(user) && !isMandatoryPasswordChangePageExempt(basePath)) {
    return NextResponse.redirect(changePasswordRedirectUrl(request), 307);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
