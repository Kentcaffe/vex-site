import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/** Obligatoriu pentru next-intl: fără middleware, primul segment din URL (ex. `chat`) e tratat ca `[locale]` → 404. */
export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(ro|ru|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
