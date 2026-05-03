import {
  countListingImageLines,
  listingFormCoreSchema,
  LISTING_MIN_IMAGES,
  parseListingImageUrlsStrict,
  rawFromFormData,
} from "@/lib/listing-form-schema";

export type ListingFormFieldId =
  | "categoryId"
  | "title"
  | "description"
  | "price"
  | "city"
  | "condition"
  | "imagesRaw";

export const LISTING_FORM_FIELD_ORDER: ListingFormFieldId[] = [
  "categoryId",
  "title",
  "description",
  "price",
  "city",
  "condition",
  "imagesRaw",
];

export type ListingFormValidationMessages = {
  errCategory: string;
  errTitle: string;
  errDescription: string;
  errPrice: string;
  errCity: string;
  errCondition: string;
  errImages: string;
  errImagesRequired: string;
};

export type ClientValidationResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<ListingFormFieldId, string>>; firstField: ListingFormFieldId };

function issueToFieldMessage(
  path: readonly (string | number | symbol)[] | undefined,
  msg: ListingFormValidationMessages,
): { field: ListingFormFieldId; text: string } | null {
  const key = path?.[0];
  if (typeof key === "symbol") {
    return null;
  }
  if (key === "categoryId") {
    return { field: "categoryId", text: msg.errCategory };
  }
  if (key === "title") {
    return { field: "title", text: msg.errTitle };
  }
  if (key === "description") {
    return { field: "description", text: msg.errDescription };
  }
  if (key === "price") {
    return { field: "price", text: msg.errPrice };
  }
  if (key === "city") {
    return { field: "city", text: msg.errCity };
  }
  if (key === "condition") {
    return { field: "condition", text: msg.errCondition };
  }
  if (key === "imagesRaw") {
    return { field: "imagesRaw", text: msg.errImages };
  }
  return null;
}

const CORE_EXTRA_KEYS = ["brand", "modelName", "year", "mileageKm", "rooms", "areaSqm"] as const;

function stripCoreExtras(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const k of CORE_EXTRA_KEYS) {
    delete out[k];
  }
  return out;
}

export function validateListingFormClient(
  formData: FormData,
  msg: ListingFormValidationMessages,
): ClientValidationResult {
  const raw = rawFromFormData(formData) as Record<string, unknown>;
  const parsed = listingFormCoreSchema.safeParse(stripCoreExtras(raw));
  const errors: Partial<Record<ListingFormFieldId, string>> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const mapped = issueToFieldMessage(issue.path, msg);
      if (mapped && !errors[mapped.field]) {
        errors[mapped.field] = mapped.text;
      }
    }
  }

  const imagesRaw = String(formData.get("imagesRaw") ?? "");
  if (!parseListingImageUrlsStrict(imagesRaw)) {
    errors.imagesRaw =
      countListingImageLines(imagesRaw) < LISTING_MIN_IMAGES ? msg.errImagesRequired : msg.errImages;
  }

  const hasErrors = Object.keys(errors).length > 0;
  if (!hasErrors && parsed.success) {
    return { ok: true };
  }
  if (!hasErrors && !parsed.success) {
    return {
      ok: false,
      errors: { title: msg.errTitle },
      firstField: "title",
    };
  }

  const firstField = LISTING_FORM_FIELD_ORDER.find((f) => Boolean(errors[f])) ?? "title";
  return { ok: false, errors, firstField };
}

export type ListingLiveValues = {
  categoryId: string;
  title: string;
  description: string;
  price: string;
  city: string;
  condition: string;
  imagesRaw: string;
};

export type LiveValidateFieldOptions = {
  /** Dacă false, câmpul „Stare” nu e afișat (nu validăm). Dacă true, acceptăm doar new/used. */
  needsCoreCondition?: boolean;
  /** Limită titlu pentru validare live (implicit 160, ca schema server). */
  titleMax?: number;
  /** Limită descriere pentru validare live (implicit foarte mare). */
  descriptionMax?: number;
};

export function liveValidateField(
  field: keyof ListingLiveValues,
  values: ListingLiveValues,
  msg: ListingFormValidationMessages,
  options?: LiveValidateFieldOptions,
): string | undefined {
  switch (field) {
    case "categoryId": {
      if (!values.categoryId.trim()) {
        return msg.errCategory;
      }
      return undefined;
    }
    case "title": {
      const t = values.title.trim();
      const titleMax = options?.titleMax ?? 160;
      if (t.length > 0 && t.length < 5) {
        return msg.errTitle;
      }
      if (t.length > titleMax) {
        return msg.errTitle;
      }
      return undefined;
    }
    case "description": {
      const d = values.description.trim();
      const descMax = options?.descriptionMax ?? 1_000_000;
      if (d.length > 0 && d.length < 20) {
        return msg.errDescription;
      }
      if (values.description.length > descMax) {
        return msg.errDescription;
      }
      return undefined;
    }
    case "price": {
      const p = values.price.trim();
      if (p === "") {
        return undefined;
      }
      const n = Number(p);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 999_999_999) {
        return msg.errPrice;
      }
      return undefined;
    }
    case "city": {
      const t = values.city.trim();
      if (t.length > 0 && t.length < 2) {
        return msg.errCity;
      }
      if (t.length > 80) {
        return msg.errCity;
      }
      return undefined;
    }
    case "condition": {
      const need = options?.needsCoreCondition;
      if (need === false) {
        return undefined;
      }
      if (need === true) {
        if (!["new", "used"].includes(values.condition)) {
          return msg.errCondition;
        }
        return undefined;
      }
      if (!["new", "used", "not_applicable"].includes(values.condition)) {
        return msg.errCondition;
      }
      return undefined;
    }
    case "imagesRaw": {
      if (!parseListingImageUrlsStrict(values.imagesRaw)) {
        return countListingImageLines(values.imagesRaw) < LISTING_MIN_IMAGES
          ? msg.errImagesRequired
          : msg.errImages;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}
