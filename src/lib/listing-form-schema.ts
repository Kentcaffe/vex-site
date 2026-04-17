import { z } from "zod";

export const LISTING_MIN_IMAGES = 1;
export const LISTING_MAX_IMAGES = 8;

export const conditionEnum = z.enum(["new", "used", "not_applicable"]);

export const priceCurrencyEnum = z.enum(["MDL", "EUR"]);

export const listingFormSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(20).max(1_000_000),
  price: z.coerce.number().int().min(1).max(999_999_999),
  priceCurrency: priceCurrencyEnum,
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
  categorySlug: z.string().max(150).optional(),
  locale: z.string().min(2).max(5),
});

export const listingFormCoreSchema = listingFormSchema.omit({
  brand: true,
  modelName: true,
  year: true,
  mileageKm: true,
  rooms: true,
  areaSqm: true,
});

export function countListingImageLines(raw: string | null | undefined): number {
  if (!raw || !String(raw).trim()) {
    return 0;
  }
  return String(raw)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

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

export function isValidImageRef(s: string): boolean {
  const t = s.trim();
  if (t.startsWith("/uploads/")) {
    return /^\/uploads\/listings\/[^/]+$/i.test(t);
  }
  if (t.startsWith("/api/listings/image/")) {
    return /^\/api\/listings\/image\/[^/]+$/i.test(t);
  }
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseStoredListingImages(json: string | null): string[] {
  if (!json) {
    return [];
  }
  const raw = String(json).trim();
  if (!raw) {
    return [];
  }

  try {
    const v = JSON.parse(raw) as unknown;
    if (Array.isArray(v)) {
      return v
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => isValidImageRef(s));
    }
    if (typeof v === "string" && v.trim() && isValidImageRef(v.trim())) {
      return [v.trim()];
    }
  } catch {
    // text brut (ex. un URL pe linie, fără JSON)
  }

  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => isValidImageRef(s));
  if (lines.length > 0) {
    return lines.slice(0, LISTING_MAX_IMAGES);
  }

  if (isValidImageRef(raw)) {
    return [raw];
  }

  return [];
}

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
  const categoryIdRaw = g("categoryId");
  const categoryIdCompatRaw = g("category_id");
  const subcategoryIdRaw = g("subcategory_id");
  const categoryId =
    (categoryIdRaw == null ? "" : String(categoryIdRaw).trim()) ||
    (categoryIdCompatRaw == null ? "" : String(categoryIdCompatRaw).trim()) ||
    (subcategoryIdRaw == null ? "" : String(subcategoryIdRaw).trim());
  const rawImages = g("imagesRaw");
  const imagesCompat = (() => {
    const val = g("images");
    if (val == null) {
      return undefined;
    }
    const text = String(val).trim();
    if (!text) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) {
        const onlyStrings = parsed.filter((x): x is string => typeof x === "string");
        return onlyStrings.join("\n");
      }
      return text;
    } catch {
      return text;
    }
  })();
  return {
    title: g("title") == null ? "" : String(g("title")),
    description: g("description") == null ? "" : String(g("description")),
    price: g("price"),
    priceCurrency: (() => {
      const v = g("priceCurrency");
      const s = v == null ? "" : String(v).toUpperCase();
      return s === "EUR" ? "EUR" : "MDL";
    })(),
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
    imagesRaw: rawImages == null ? imagesCompat : String(rawImages),
    categoryId,
    categorySlug: optStr("categorySlug"),
    locale: g("locale") == null ? "" : String(g("locale")),
  };
}
