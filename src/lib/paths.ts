import { routing } from "@/i18n/routing";

/** Path segment fără prefix de limbă, ex. `/anunturi` */
export function localizedHref(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}
