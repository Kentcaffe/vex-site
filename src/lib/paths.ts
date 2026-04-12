import { routing } from "@/i18n/routing";

export function localizedHref(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}
