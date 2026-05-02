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

const SUPABASE_AVATAR_PUBLIC_MARKER = "/storage/v1/object/public/avatars/";

/**
 * URL-urile `.../object/public/avatars/{uid}/{file}` nu merg în browser dacă bucketul e privat
 * (403 → avatar gri). Le mapăm la proxy-ul nostru care citește cu service role.
 */
function avatarPublicUrlToAppProxyPath(url: string): string | null {
  const lower = url.toLowerCase();
  const idx = lower.indexOf(SUPABASE_AVATAR_PUBLIC_MARKER);
  if (idx < 0) return null;
  let path = url.slice(idx + SUPABASE_AVATAR_PUBLIC_MARKER.length).split(/[?#]/)[0] ?? "";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* păstrăm path brut */
  }
  const slash = path.indexOf("/");
  if (slash <= 0 || slash >= path.length - 1) return null;
  const uid = path.slice(0, slash);
  const file = path.slice(slash + 1);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uid)) return null;
  if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) return null;
  if (!/\.(jpe?g|png|webp|gif)$/i.test(file)) return null;
  return `/api/avatars/${uid}/${encodeURIComponent(file)}`;
}

/**
 * Returnează URL absolut pentru afișare sau `null` dacă nu e aplicabil.
 */
export function resolvePublicMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const t = String(url).trim();
  if (!t) return null;

  const avatarProxy = avatarPublicUrlToAppProxyPath(t);
  if (avatarProxy) {
    return avatarProxy;
  }

  if (t.startsWith("/api/avatars/")) {
    return t;
  }

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

  /** Rămâne pe același origin — fișierele sunt servite de `/api/listings/image` (disc local sau proxy Storage). */
  const apiImg = t.match(/^\/api\/listings\/image\/([^/]+)$/i);
  if (apiImg?.[1]) {
    const file = apiImg[1];
    return `/api/listings/image/${encodeURIComponent(file)}`;
  }

  if (t.startsWith("/")) {
    return t;
  }

  return null;
}
