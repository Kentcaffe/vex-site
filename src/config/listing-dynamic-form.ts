/**
 * Formulare dinamice pe categorie.
 *
 * - **Câmpuri publicare (UI principal / cfg_)**: `src/config/listing-dynamic-fields.json` → `publish.*`,
 *   materializate în `@/lib/listing-category-config` (`materializePublishFields`).
 * - **Detalii extra (detailsJson / d_)**: același JSON → `extraDetail.templates` + `extraDetail.rules`,
 *   materializate în `@/lib/listing-detail-config` (`getDetailFieldsForSlug`).
 * - Opțiuni comune: `@/lib/listing-form-options`, marcă/model auto: `@/lib/vehicle-taxonomy` etc.
 *
 * Regenerare JSON (opțional): `node scripts/gen-listing-dynamic-fields.mjs`
 *
 * Datele se salvează în `Listing.detailsJson` (+ coloane `brand`, `modelName`, `year`, `mileageKm`, `rooms`, `areaSqm` unde e cazul).
 */
export { getDetailFieldsForSlug, type DetailField, type SpecRow } from "@/lib/listing-detail-config";
