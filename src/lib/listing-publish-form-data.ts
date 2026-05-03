import type { DetailField } from "@/lib/listing-detail-config";
import { getDetailFormName } from "@/lib/listing-detail-config";
import { parseImageLines } from "@/lib/listing-form-schema";
import {
  LISTING_DRAFT_STORAGE_VERSION,
  type ListingFormDraftV1,
} from "@/lib/listing-form-draft-storage";

/** Câmpuri fixe + chei suplimentare pentru detalii dinamice (ex. detail_*) */
export type PublishFormValues = {
  title: string;
  description: string;
  price: string;
  priceCurrency: string;
  negotiable: boolean;
  city: string;
  district: string;
  phone: string;
  condition: string;
  brand: string;
  /** Id marcă din `catalog_brands` când formularul folosește catalogul server; gol = listă statică. */
  catalogBrandId: string;
  modelName: string;
  year: string;
  mileageKm: string;
  rooms: string;
  areaSqm: string;
  /** Câmpuri dinamice după numele din formular */
  extra: Record<string, string>;
};

export const emptyPublishFormValues = (): PublishFormValues => ({
  title: "",
  description: "",
  price: "",
  priceCurrency: "MDL",
  negotiable: false,
  city: "",
  district: "",
  phone: "",
  condition: "used",
  brand: "",
  catalogBrandId: "",
  modelName: "",
  year: "",
  mileageKm: "",
  rooms: "",
  areaSqm: "",
  extra: {},
});

const KNOWN_VALUE_KEYS = new Set([
  "title",
  "description",
  "price",
  "priceCurrency",
  "negotiable",
  "city",
  "district",
  "phone",
  "condition",
  "brand",
  "catalogBrandId",
  "modelName",
  "year",
  "mileageKm",
  "rooms",
  "areaSqm",
]);

export function publishValuesFromDraftValues(
  values: Record<string, string | boolean>,
): PublishFormValues {
  const g = (k: string, d: string) => (typeof values[k] === "string" ? (values[k] as string) : d);
  const gb = (k: string) => values[k] === true;
  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (KNOWN_VALUE_KEYS.has(k)) continue;
    extra[k] = typeof v === "boolean" ? (v ? "on" : "") : String(v ?? "");
  }
  return {
    title: g("title", ""),
    description: g("description", ""),
    price: g("price", ""),
    priceCurrency: g("priceCurrency", "MDL") === "EUR" ? "EUR" : "MDL",
    negotiable: gb("negotiable"),
    city: g("city", ""),
    district: g("district", ""),
    phone: g("phone", ""),
    condition: ["new", "used", "not_applicable"].includes(g("condition", "used"))
      ? g("condition", "used")
      : "used",
    brand: g("brand", ""),
    catalogBrandId: g("catalogBrandId", ""),
    modelName: g("modelName", ""),
    year: g("year", ""),
    mileageKm: g("mileageKm", ""),
    rooms: g("rooms", ""),
    areaSqm: g("areaSqm", ""),
    extra,
  };
}

export function listingDraftFromPublishValues(
  categoryId: string,
  imagesRaw: string,
  values: PublishFormValues,
): ListingFormDraftV1 {
  const cat = categoryId.trim();
  const flat: Record<string, string | boolean> = {
    title: values.title,
    description: values.description,
    price: values.price,
    priceCurrency: values.priceCurrency,
    negotiable: values.negotiable,
    city: values.city,
    district: values.district,
    phone: values.phone,
    condition: values.condition,
    brand: values.brand,
    catalogBrandId: values.catalogBrandId,
    modelName: values.modelName,
    year: values.year,
    mileageKm: values.mileageKm,
    rooms: values.rooms,
    areaSqm: values.areaSqm,
    ...values.extra,
  };
  return {
    v: LISTING_DRAFT_STORAGE_VERSION,
    categoryId: cat,
    imagesRaw,
    values: flat,
  };
}

export function buildFormDataFromPublishValues(
  locale: string,
  categoryId: string,
  categorySlug: string,
  imagesRaw: string,
  values: PublishFormValues,
  detailFields: DetailField[],
  /** Dacă e setat, serverul face update (proprietar). */
  listingIdForUpdate?: string | null,
): FormData {
  const categoryLeafId = categoryId.trim();
  const imageList = parseImageLines(imagesRaw);
  const fd = new FormData();
  const lid = listingIdForUpdate?.trim();
  if (lid) {
    fd.set("listingId", lid);
  }
  fd.set("locale", locale);
  fd.set("categoryId", categoryLeafId);
  fd.set("category_id", categoryLeafId);
  fd.set("subcategory_id", categoryLeafId);
  fd.set("categorySlug", categorySlug.trim());
  fd.set("imagesRaw", imagesRaw);
  fd.set("images", JSON.stringify(imageList));
  fd.set("title", values.title);
  fd.set("description", values.description);
  fd.set("price", values.price);
  fd.set("priceCurrency", values.priceCurrency);
  if (values.negotiable) {
    fd.set("negotiable", "on");
  }
  fd.set("city", values.city);
  fd.set("district", values.district);
  fd.set("phone", values.phone);
  fd.set("condition", values.condition);
  fd.set("brand", values.brand);
  fd.set("modelName", values.modelName);
  fd.set("year", values.year);
  fd.set("mileageKm", values.mileageKm);
  fd.set("rooms", values.rooms);
  fd.set("areaSqm", values.areaSqm);

  for (const field of detailFields) {
    const name = getDetailFormName(field);
    fd.set(name, values.extra[name] ?? "");
  }
  for (const [key, value] of Object.entries(values.extra)) {
    if (!key.startsWith("cfg_")) {
      continue;
    }
    fd.set(key, value ?? "");
  }

  return fd;
}

/** Cheie suplimentară (pattern „draft_ad”) — același JSON ca la ciorna principală. */
export function draftAdStorageKey(userId: string, locale: string): string {
  return `draft_ad:${userId}:${locale}`;
}

export function saveDraftAdMirror(key: string, draft: ListingFormDraftV1): void {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function clearDraftAdMirror(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
