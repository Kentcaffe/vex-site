import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { emptyPublishFormValues, type PublishFormValues } from "@/lib/listing-publish-form-data";

/** Rând minim din DB pentru formularul de editare. */
export type DbListingForEdit = {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  priceCurrency: string;
  negotiable: boolean;
  city: string;
  district: string | null;
  phone: string | null;
  condition: string;
  brand: string | null;
  modelName: string | null;
  year: number | null;
  mileageKm: number | null;
  rooms: string | null;
  areaSqm: number | null;
  images: string | null;
  detailsJson: string | null;
};

/** Construiește starea inițială pentru `ListingForm` (editare). */
export function buildPublishValuesForEdit(row: DbListingForEdit): {
  categoryId: string;
  imagesRaw: string;
  publishValues: PublishFormValues;
} {
  const images = parseStoredListingImages(row.images);
  const imagesRaw = images.join("\n");
  const v = emptyPublishFormValues();
  v.title = row.title;
  v.description = row.description;
  v.price = String(row.price);
  v.priceCurrency = row.priceCurrency === "EUR" ? "EUR" : "MDL";
  v.negotiable = row.negotiable;
  v.city = row.city;
  v.district = row.district ?? "";
  v.phone = row.phone ?? "";
  v.condition = ["new", "used", "not_applicable"].includes(row.condition) ? row.condition : "used";
  v.brand = row.brand ?? "";
  v.modelName = row.modelName ?? "";
  v.year = row.year != null ? String(row.year) : "";
  v.mileageKm = row.mileageKm != null ? String(row.mileageKm) : "";
  v.rooms = row.rooms ?? "";
  v.areaSqm = row.areaSqm != null ? String(row.areaSqm) : "";

  const extra: Record<string, string> = {};
  if (row.detailsJson) {
    try {
      const parsed = JSON.parse(row.detailsJson) as Record<string, unknown>;
      for (const [key, val] of Object.entries(parsed)) {
        if (val === null || val === undefined) continue;
        extra[`d_${key}`] = typeof val === "number" ? String(val) : String(val);
      }
    } catch {
      /* ignore invalid JSON */
    }
  }
  v.extra = extra;
  return { categoryId: row.categoryId, imagesRaw, publishValues: v };
}
