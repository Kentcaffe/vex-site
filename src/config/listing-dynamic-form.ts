/**
 * Formulare dinamice pe categorie (config în cod, ușor de versionat în Git).
 *
 * - Schema câmpurilor: `getDetailFieldsForSlug` din `@/lib/listing-detail-config`
 * - Opțiuni comune (ani, etaje, culori…): `@/lib/listing-form-options`
 * - Auto: `@/lib/vehicle-taxonomy`, `@/lib/vehicle-models-by-brand`, `@/lib/vehicle-generations`
 * - Electronice: `@/lib/electronics-taxonomy`
 *
 * Datele se salvează în `Listing.detailsJson` (+ coloane `brand`, `modelName`, `year`, `mileageKm`, `rooms`, `areaSqm` unde e cazul).
 * Filtre listă: `src/app/[locale]/anunturi/page.tsx` + `AnunturiFilters` (query params aliniate cu aceleași chei).
 */
export { getDetailFieldsForSlug, type DetailField, type SpecRow } from "@/lib/listing-detail-config";
