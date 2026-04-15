import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * next-intl: fără middleware, primul segment din URL (ex. `chat`) e tratat ca `[locale]` → 404.
 * Supabase: reîmprospătare sesie + scriere cookie-uri pe răspuns (evită eroarea „Cookies can only
 * be modified in a Server Action or Route Handler” în RSC).
 */
export default async function middleware(request: NextRequest) {
  const response = await Promise.resolve(intlMiddleware(request));

  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    return response;
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

  return response;
}

export const config = {
  matcher: ["/", "/(ro|ru|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
