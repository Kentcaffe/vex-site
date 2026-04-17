/**
 * Normalizează URL-uri pentru imagini (listings, avatare): legacy `/uploads/listings/…`
 * → URL public Supabase Storage când env este setat.
 * Fără Supabase configurat, păstrează `/api/listings/image/:name` (servire locală).
 */

function supabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** Bucket pentru fișiere listings (public). Fallback: `listings`. */
function listingsBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "listings";
}

/**
 * Returnează URL absolut pentru afișare sau `null` dacă nu e aplicabil.
 */
export function resolvePublicMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const t = String(url).trim();
  if (!t) return null;

  if (t.startsWith("http://") || t.startsWith("https://")) {
    return t;
  }

  const origin = supabaseOrigin();
  const bucket = listingsBucket();

  const uploads = t.match(/^\/uploads\/listings\/([^/]+)$/i);
  if (uploads?.[1]) {
    const file = uploads[1];
    if (origin) {
      return `${origin}/storage/v1/object/public/${bucket}/listings/${encodeURIComponent(file)}`;
    }
    return `/api/listings/image/${encodeURIComponent(file)}`;
  }

  const apiImg = t.match(/^\/api\/listings\/image\/([^/]+)$/i);
  if (apiImg?.[1]) {
    const file = apiImg[1];
    if (origin) {
      return `${origin}/storage/v1/object/public/${bucket}/listings/${encodeURIComponent(file)}`;
    }
    return `/api/listings/image/${encodeURIComponent(file)}`;
  }

  if (t.startsWith("/")) {
    return t;
  }

  return null;
}
