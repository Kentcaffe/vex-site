import { localizedHref } from "@/lib/paths";

const SITE_URL_FALLBACK = "https://vex.md";

function normalizeSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? SITE_URL_FALLBACK).trim().replace(/\/$/, "");
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    console.error("[seo] Invalid NEXT_PUBLIC_APP_URL. Falling back to https://vex.md");
    return SITE_URL_FALLBACK;
  }
}

const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL);

export function siteUrl(): string {
  return SITE_URL;
}

/** URL absolut canonical (ex. `https://vex.md/anunturi`). */
export function absoluteCanonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

export function slugifyForSeo(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return normalized || "anunt";
}

export function listingSeoPath(input: {
  id: string;
  title: string;
  city?: string | null;
}): string {
  const head = [input.title, input.city ?? ""].filter(Boolean).join(" ");
  const slug = slugifyForSeo(head);
  return `/anunt/${slug}-${input.id}`;
}

/** Canonical + og:url absolute din pathname (ex. `/anunturi` → `https://vex.md/anunturi`). */
export function pageCanonicalMetadata(pathname: string): {
  alternates: { canonical: string };
  openGraph: { url: string };
} {
  const absolute = absoluteCanonicalUrl(pathname);
  return {
    alternates: { canonical: absolute },
    openGraph: { url: absolute },
  };
}

/** Canonical localizat: `/anunturi` (ro) sau `/en/anunturi`. */
export function localePageCanonicalMetadata(
  locale: string,
  path: string,
): {
  alternates: { canonical: string };
  openGraph: { url: string };
} {
  return pageCanonicalMetadata(localizedHref(locale, path));
}

export function listingIdFromSeoSlug(slug: string): string | null {
  const raw = slug.trim();
  if (!raw) return null;
  const idx = raw.lastIndexOf("-");
  if (idx < 0 || idx === raw.length - 1) return null;
  const id = raw.slice(idx + 1).trim();
  if (!id) return null;
  return id;
}
