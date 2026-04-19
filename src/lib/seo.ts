const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vex.md").replace(/\/$/, "");

export function siteUrl(): string {
  return SITE_URL;
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

export function listingIdFromSeoSlug(slug: string): string | null {
  const raw = slug.trim();
  if (!raw) return null;
  const idx = raw.lastIndexOf("-");
  if (idx < 0 || idx === raw.length - 1) return null;
  const id = raw.slice(idx + 1).trim();
  if (!id) return null;
  return id;
}
