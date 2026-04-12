import { z } from "zod";

/** Min/max imagini la publicare; prima în listă = copertă. */
export const LISTING_MIN_IMAGES = 1;
export const LISTING_MAX_IMAGES = 8;

export const conditionEnum = z.enum(["new", "used", "not_applicable"]);

/** Schema comună server + client pentru câmpurile principale ale formularului. */
export const listingFormSchema = z.object({
  title: z.string().min(3).max(160),
  /** Fără minim — poate fi gol; limită superioară doar ca protecție. */
  description: z.string().max(1_000_000),
  price: z.coerce.number().int().min(0).max(999_999_999),
  negotiable: z.boolean().optional(),
  city: z.string().min(2).max(80),
  district: z.string().max(80).optional(),
  phone: z.string().max(30).optional(),
  condition: conditionEnum,
  brand: z.string().max(80).optional(),
  modelName: z.string().max(80).optional(),
  year: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(1950).max(2030).optional(),
  ),
  mileageKm: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(0).max(9_999_999).optional(),
  ),
  rooms: z.string().max(40).optional(),
  areaSqm: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(1).max(999_999_999).optional(),
  ),
  imagesRaw: z.string().max(100_000).optional(),
  categoryId: z.string().min(1),
  locale: z.string().min(2).max(5),
});

export type ListingFormSchemaIn = z.input<typeof listingFormSchema>;

/** Doar câmpuri principale — folosit la validare client înainte de submit (fără detalii categorie). */
export const listingFormCoreSchema = listingFormSchema.omit({
  brand: true,
  modelName: true,
  year: true,
  mileageKm: true,
  rooms: true,
  areaSqm: true,
});

/** Linii non-goale din raw (fără tăiere — pentru validare strictă). */
export function countListingImageLines(raw: string | null | undefined): number {
  if (!raw || !String(raw).trim()) {
    return 0;
  }
  return String(raw)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/** Parsează URL-uri din formular; taie la max (ciornă / UI). */
export function parseImageLines(raw: string | null): string[] {
  if (!raw || !String(raw).trim()) {
    return [];
  }
  return String(raw)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, LISTING_MAX_IMAGES);
}

/** JSON din coloana `images` (array de URL-uri). */
export function parseStoredListingImages(json: string | null): string[] {
  if (!json) {
    return [];
  }
  try {
    const v = JSON.parse(json) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * FormData.get() poate returna `null` — Zod `z.string().optional()` nu acceptă `null`, doar `undefined`.
 */
export function rawFromFormData(formData: FormData): Record<string, unknown> {
  const g = (key: string) => formData.get(key);
  const optStr = (key: string) => {
    const v = g(key);
    if (v === null || v === undefined) {
      return undefined;
    }
    const s = String(v);
    return s === "" ? undefined : s;
  };
  return {
    title: g("title") == null ? "" : String(g("title")),
    description: g("description") == null ? "" : String(g("description")),
    price: g("price"),
    negotiable: g("negotiable") === "on",
    city: g("city") == null ? "" : String(g("city")),
    district: optStr("district"),
    phone: optStr("phone"),
    condition: (g("condition") as string | null) ?? "not_applicable",
    brand: optStr("brand"),
    modelName: optStr("modelName"),
    year: g("year"),
    mileageKm: g("mileageKm"),
    rooms: optStr("rooms"),
    areaSqm: g("areaSqm"),
    imagesRaw: g("imagesRaw") == null ? undefined : String(g("imagesRaw")),
    categoryId: g("categoryId") == null ? "" : String(g("categoryId")),
    locale: g("locale") == null ? "" : String(g("locale")),
  };
}

/** Acceptă https URL sau cale relativă de încărcare locală. */
export function isValidImageRef(s: string): boolean {
  const t = s.trim();
  if (t.startsWith("/uploads/")) {
    return /^\/uploads\/listings\/[^/]+$/i.test(t);
  }
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * URL-uri valide pentru publicare: între LISTING_MIN_IMAGES și LISTING_MAX_IMAGES, fiecare ref. valid.
 * Returnează `null` dacă nu e ok.
 */
export function parseListingImageUrlsStrict(raw: string | null | undefined): string[] | null {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length < LISTING_MIN_IMAGES || lines.length > LISTING_MAX_IMAGES) {
    return null;
  }
  if (!lines.every(isValidImageRef)) {
    return null;
  }
  return lines;
}
