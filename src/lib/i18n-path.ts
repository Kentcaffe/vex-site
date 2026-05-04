import { routing } from "@/i18n/routing";

/** Elimină prefixul de limbă din pathname (ex. `/en/cont` → `/cont`). Pentru `localePrefix: as-needed`, `ro` e implicit fără prefix. */
export function stripLocalePrefix(pathname: string): string {
  for (const loc of routing.locales) {
    if (loc === routing.defaultLocale) {
      continue;
    }
    const prefix = `/${loc}`;
    if (pathname === prefix) {
      return "/";
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname;
}
