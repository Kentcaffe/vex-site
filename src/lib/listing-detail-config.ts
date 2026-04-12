/**
 * Câmpuri „Detalii” per categorie frunză (slug). An și kilometraj doar pentru autovehicule (mașini, SUV, moto, camioane).
 * Restul valorilor extra stau în `detailsJson`.
 */

export type ColumnName = "brand" | "modelName" | "year" | "mileageKm" | "rooms" | "areaSqm";

export type DetailField = {
  id: string;
  storage: { kind: "column"; column: ColumnName } | { kind: "json"; jsonKey: string };
  input: "text" | "number" | "select";
  /** cheie în mesaje: ListingForm.detailSelect.<group>.<value> */
  selectGroup?: string;
  selectValues?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  /** atribut HTML step pentru input number (ex. "0.1" sau "any") */
  numberStep?: string;
};

const carLike: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "year", storage: { kind: "column", column: "year" }, input: "number", min: 1950, max: 2030 },
  { id: "mileage_km", storage: { kind: "column", column: "mileageKm" }, input: "number", min: 0, max: 9_999_999 },
  {
    id: "fuel",
    storage: { kind: "json", jsonKey: "fuel" },
    input: "select",
    selectGroup: "fuel",
    selectValues: ["petrol", "diesel", "electric", "hybrid", "lpg", "other"],
  },
  {
    id: "transmission",
    storage: { kind: "json", jsonKey: "transmission" },
    input: "select",
    selectGroup: "transmission",
    selectValues: ["manual", "automatic", "cvt", "other"],
  },
  { id: "engine_cc", storage: { kind: "json", jsonKey: "engine_cc" }, input: "text", maxLength: 40 },
  {
    id: "body_type",
    storage: { kind: "json", jsonKey: "body_type" },
    input: "select",
    selectGroup: "body_type",
    selectValues: ["sedan", "hatchback", "wagon", "coupe", "suv", "van", "other"],
  },
];

const motoLike: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "year", storage: { kind: "column", column: "year" }, input: "number", min: 1950, max: 2030 },
  { id: "mileage_km", storage: { kind: "column", column: "mileageKm" }, input: "number", min: 0, max: 9_999_999 },
  { id: "displacement_cc", storage: { kind: "json", jsonKey: "displacement_cc" }, input: "number", min: 1, max: 5000 },
  {
    id: "fuel",
    storage: { kind: "json", jsonKey: "fuel" },
    input: "select",
    selectGroup: "fuel",
    selectValues: ["petrol", "diesel", "electric", "other"],
  },
];

const truckLike: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "year", storage: { kind: "column", column: "year" }, input: "number", min: 1950, max: 2030 },
  { id: "mileage_km", storage: { kind: "column", column: "mileageKm" }, input: "number", min: 0, max: 9_999_999 },
  {
    id: "gross_weight_t",
    storage: { kind: "json", jsonKey: "gross_weight_t" },
    input: "number",
    min: 0.1,
    max: 80,
    numberStep: "0.1",
  },
  {
    id: "axle_config",
    storage: { kind: "json", jsonKey: "axle_config" },
    input: "select",
    selectGroup: "axle_config",
    selectValues: ["4x2", "4x4", "6x4", "other"],
  },
];

const wheels: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "tire_size", storage: { kind: "json", jsonKey: "tire_size" }, input: "text", maxLength: 40 },
  {
    id: "season",
    storage: { kind: "json", jsonKey: "season" },
    input: "select",
    selectGroup: "tire_season",
    selectValues: ["summer", "winter", "all_season"],
  },
  { id: "rim_diameter", storage: { kind: "json", jsonKey: "rim_diameter" }, input: "text", maxLength: 20 },
  { id: "bolt_pattern", storage: { kind: "json", jsonKey: "bolt_pattern" }, input: "text", maxLength: 30 },
];

const autoService: DetailField[] = [
  { id: "service_specialty", storage: { kind: "json", jsonKey: "service_specialty" }, input: "text", maxLength: 120 },
  { id: "experience_years", storage: { kind: "json", jsonKey: "experience_years" }, input: "number", min: 0, max: 80 },
  { id: "service_radius_km", storage: { kind: "json", jsonKey: "service_radius_km" }, input: "number", min: 1, max: 500 },
  {
    id: "mobile_service",
    storage: { kind: "json", jsonKey: "mobile_service" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const apartmentLike: DetailField[] = [
  { id: "rooms", storage: { kind: "column", column: "rooms" }, input: "text", maxLength: 40 },
  { id: "area_sqm", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 999_999 },
  { id: "floor", storage: { kind: "json", jsonKey: "floor" }, input: "text", maxLength: 20 },
  { id: "year_built", storage: { kind: "json", jsonKey: "year_built" }, input: "number", min: 1800, max: 2030 },
  {
    id: "building_type",
    storage: { kind: "json", jsonKey: "building_type" },
    input: "select",
    selectGroup: "building_type",
    selectValues: ["block", "new_building", "historic", "other"],
  },
];

const houseLike: DetailField[] = [
  { id: "rooms", storage: { kind: "column", column: "rooms" }, input: "text", maxLength: 40 },
  { id: "area_sqm", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 999_999 },
  { id: "land_area_sqm", storage: { kind: "json", jsonKey: "land_area_sqm" }, input: "number", min: 1, max: 9_999_999 },
  { id: "year_built", storage: { kind: "json", jsonKey: "year_built" }, input: "number", min: 1800, max: 2030 },
];

const landOnly: DetailField[] = [
  { id: "area_sqm", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 999_999_999 },
  {
    id: "land_use",
    storage: { kind: "json", jsonKey: "land_use" },
    input: "select",
    selectGroup: "land_use",
    selectValues: ["construction", "agriculture", "forest", "commercial", "other"],
  },
  { id: "frontage_m", storage: { kind: "json", jsonKey: "frontage_m" }, input: "number", min: 1, max: 99_999 },
  { id: "utilities", storage: { kind: "json", jsonKey: "utilities" }, input: "text", maxLength: 120 },
];

const commercialRe: DetailField[] = [
  { id: "usable_area", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 999_999 },
  { id: "rooms_layout", storage: { kind: "column", column: "rooms" }, input: "text", maxLength: 40 },
  { id: "floor", storage: { kind: "json", jsonKey: "floor" }, input: "text", maxLength: 20 },
  { id: "parking_spaces", storage: { kind: "json", jsonKey: "parking_spaces" }, input: "number", min: 0, max: 500 },
];

const garageRe: DetailField[] = [
  { id: "area_sqm", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 99_999 },
  { id: "height_m", storage: { kind: "json", jsonKey: "height_m" }, input: "number", min: 1, max: 20 },
  {
    id: "access_type",
    storage: { kind: "json", jsonKey: "access_type" },
    input: "select",
    selectGroup: "garage_access",
    selectValues: ["underground", "ground_level", "elevator", "other"],
  },
];

const rentRe: DetailField[] = [
  { id: "rooms", storage: { kind: "column", column: "rooms" }, input: "text", maxLength: 40 },
  { id: "area_sqm", storage: { kind: "column", column: "areaSqm" }, input: "number", min: 1, max: 999_999 },
  { id: "deposit", storage: { kind: "json", jsonKey: "deposit" }, input: "text", maxLength: 40 },
  {
    id: "utilities_included",
    storage: { kind: "json", jsonKey: "utilities_included" },
    input: "select",
    selectGroup: "utilities_included",
    selectValues: ["all", "partial", "none"],
  },
  {
    id: "min_contract_months",
    storage: { kind: "json", jsonKey: "min_contract_months" },
    input: "number",
    min: 0,
    max: 120,
  },
];

const phoneFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "storage_gb", storage: { kind: "json", jsonKey: "storage_gb" }, input: "number", min: 1, max: 2048 },
  { id: "color", storage: { kind: "json", jsonKey: "color" }, input: "text", maxLength: 40 },
  {
    id: "dual_sim",
    storage: { kind: "json", jsonKey: "dual_sim" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const laptopFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "year", storage: { kind: "column", column: "year" }, input: "number", min: 1990, max: 2030 },
  { id: "ram_gb", storage: { kind: "json", jsonKey: "ram_gb" }, input: "number", min: 1, max: 512 },
  { id: "ssd_gb", storage: { kind: "json", jsonKey: "ssd_gb" }, input: "number", min: 0, max: 8192 },
  { id: "screen_inch", storage: { kind: "json", jsonKey: "screen_inch" }, input: "number", min: 10, max: 20 },
  { id: "processor", storage: { kind: "json", jsonKey: "processor" }, input: "text", maxLength: 80 },
];

const tvFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "diagonal_inch", storage: { kind: "json", jsonKey: "diagonal_inch" }, input: "number", min: 15, max: 120 },
  {
    id: "resolution",
    storage: { kind: "json", jsonKey: "resolution" },
    input: "select",
    selectGroup: "resolution",
    selectValues: ["hd", "full_hd", "4k", "8k", "other"],
  },
  {
    id: "smart_tv",
    storage: { kind: "json", jsonKey: "smart_tv" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const photoFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  {
    id: "mount_type",
    storage: { kind: "json", jsonKey: "mount_type" },
    input: "select",
    selectGroup: "camera_mount",
    selectValues: ["dslr_mirrorless", "compact", "action", "drone", "other"],
  },
  { id: "sensor_size", storage: { kind: "json", jsonKey: "sensor_size" }, input: "text", maxLength: 40 },
  { id: "shutter_count", storage: { kind: "json", jsonKey: "shutter_count" }, input: "number", min: 0, max: 9_999_999 },
];

const gamesFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "year", storage: { kind: "column", column: "year" }, input: "number", min: 1990, max: 2030 },
  {
    id: "platform",
    storage: { kind: "json", jsonKey: "platform" },
    input: "select",
    selectGroup: "game_platform",
    selectValues: ["pc", "ps5", "ps4", "xbox", "switch", "other"],
  },
];

const applianceFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  {
    id: "energy_class",
    storage: { kind: "json", jsonKey: "energy_class" },
    input: "select",
    selectGroup: "energy_class",
    selectValues: ["a", "b", "c", "d", "e", "unknown"],
  },
  { id: "capacity", storage: { kind: "json", jsonKey: "capacity" }, input: "text", maxLength: 60 },
];

const furnitureFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "dimensions", storage: { kind: "json", jsonKey: "dimensions" }, input: "text", maxLength: 60 },
  { id: "material", storage: { kind: "json", jsonKey: "material" }, input: "text", maxLength: 80 },
  { id: "weight_kg", storage: { kind: "json", jsonKey: "weight_kg" }, input: "number", min: 0.1, max: 2000 },
];

const repairFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "tool_type", storage: { kind: "json", jsonKey: "tool_type" }, input: "text", maxLength: 80 },
  { id: "power_w", storage: { kind: "json", jsonKey: "power_w" }, input: "number", min: 1, max: 50_000 },
];

const gardenFields: DetailField[] = [
  { id: "product_type", storage: { kind: "json", jsonKey: "product_type" }, input: "text", maxLength: 80 },
  { id: "pot_size_cm", storage: { kind: "json", jsonKey: "pot_size_cm" }, input: "number", min: 1, max: 500 },
];

const fashionClothing: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "style_line", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "size_label", storage: { kind: "json", jsonKey: "size_label" }, input: "text", maxLength: 20 },
  { id: "color", storage: { kind: "json", jsonKey: "color" }, input: "text", maxLength: 40 },
  { id: "fabric", storage: { kind: "json", jsonKey: "fabric" }, input: "text", maxLength: 60 },
];

const fashionShoes: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "size_eu", storage: { kind: "json", jsonKey: "size_eu" }, input: "text", maxLength: 10 },
  { id: "color", storage: { kind: "json", jsonKey: "color" }, input: "text", maxLength: 40 },
  {
    id: "width",
    storage: { kind: "json", jsonKey: "width" },
    input: "select",
    selectGroup: "shoe_width",
    selectValues: ["narrow", "standard", "wide", "unknown"],
  },
];

const fashionAcc: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "material", storage: { kind: "json", jsonKey: "material" }, input: "text", maxLength: 80 },
  { id: "color", storage: { kind: "json", jsonKey: "color" }, input: "text", maxLength: 40 },
];

const kidsClothing: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "age_size", storage: { kind: "json", jsonKey: "age_size" }, input: "text", maxLength: 30 },
  { id: "color", storage: { kind: "json", jsonKey: "color" }, input: "text", maxLength: 40 },
];

const kidsToys: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "age_range", storage: { kind: "json", jsonKey: "age_range" }, input: "text", maxLength: 30 },
  {
    id: "battery",
    storage: { kind: "json", jsonKey: "battery" },
    input: "select",
    selectGroup: "battery_included",
    selectValues: ["yes", "no", "na"],
  },
];

const kidsStrollers: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "weight_kg", storage: { kind: "json", jsonKey: "weight_kg" }, input: "number", min: 1, max: 50 },
  {
    id: "foldable",
    storage: { kind: "json", jsonKey: "foldable" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
  { id: "travel_system", storage: { kind: "json", jsonKey: "travel_system" }, input: "text", maxLength: 60 },
];

const sportFields: DetailField[] = [
  { id: "brand", storage: { kind: "column", column: "brand" }, input: "text", maxLength: 80 },
  { id: "model", storage: { kind: "column", column: "modelName" }, input: "text", maxLength: 80 },
  { id: "sport_type", storage: { kind: "json", jsonKey: "sport_type" }, input: "text", maxLength: 60 },
  { id: "item_size", storage: { kind: "json", jsonKey: "item_size" }, input: "text", maxLength: 30 },
];

const servicesIt: DetailField[] = [
  { id: "specialty", storage: { kind: "json", jsonKey: "specialty" }, input: "text", maxLength: 120 },
  { id: "response_time", storage: { kind: "json", jsonKey: "response_time" }, input: "text", maxLength: 40 },
  {
    id: "remote_ok",
    storage: { kind: "json", jsonKey: "remote_ok" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const servicesBeauty: DetailField[] = [
  { id: "specialty", storage: { kind: "json", jsonKey: "specialty" }, input: "text", maxLength: 120 },
  {
    id: "home_visit",
    storage: { kind: "json", jsonKey: "home_visit" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
  {
    id: "certified",
    storage: { kind: "json", jsonKey: "certified" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const servicesTransport: DetailField[] = [
  { id: "vehicle_type", storage: { kind: "json", jsonKey: "vehicle_type" }, input: "text", maxLength: 60 },
  { id: "load_capacity_kg", storage: { kind: "json", jsonKey: "load_capacity_kg" }, input: "number", min: 1, max: 50_000 },
  {
    id: "lift_available",
    storage: { kind: "json", jsonKey: "lift_available" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const jobsFields: DetailField[] = [
  {
    id: "contract_type",
    storage: { kind: "json", jsonKey: "contract_type" },
    input: "select",
    selectGroup: "contract_type",
    selectValues: ["full_time", "part_time", "project", "internship"],
  },
  {
    id: "schedule",
    storage: { kind: "json", jsonKey: "schedule" },
    input: "select",
    selectGroup: "job_schedule",
    selectValues: ["fixed", "flexible", "shifts", "remote"],
  },
  {
    id: "experience_level",
    storage: { kind: "json", jsonKey: "experience_level" },
    input: "select",
    selectGroup: "experience_level",
    selectValues: ["entry", "mid", "senior", "lead"],
  },
];

const animalsFields: DetailField[] = [
  { id: "species", storage: { kind: "json", jsonKey: "species" }, input: "text", maxLength: 60 },
  { id: "pet_age", storage: { kind: "json", jsonKey: "pet_age" }, input: "text", maxLength: 40 },
  {
    id: "vaccinated",
    storage: { kind: "json", jsonKey: "vaccinated" },
    input: "select",
    selectGroup: "yes_no_unknown",
    selectValues: ["yes", "no", "unknown"],
  },
  {
    id: "pedigree",
    storage: { kind: "json", jsonKey: "pedigree" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const businessFields: DetailField[] = [
  { id: "equipment_type", storage: { kind: "json", jsonKey: "equipment_type" }, input: "text", maxLength: 120 },
  {
    id: "invoice_available",
    storage: { kind: "json", jsonKey: "invoice_available" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
  {
    id: "warranty",
    storage: { kind: "json", jsonKey: "warranty" },
    input: "select",
    selectGroup: "yes_no",
    selectValues: ["yes", "no"],
  },
];

const BY_SLUG: Record<string, DetailField[]> = {
  "auto-cars": carLike,
  "auto-suv": carLike,
  "auto-moto": motoLike,
  "auto-trucks": truckLike,
  "auto-wheels": wheels,
  "auto-service": autoService,
  "realestate-apartments": apartmentLike,
  "realestate-houses": houseLike,
  "realestate-land": landOnly,
  "realestate-commercial": commercialRe,
  "realestate-garages": garageRe,
  "realestate-rent": rentRe,
  "electronics-phones": phoneFields,
  "electronics-laptops": laptopFields,
  "electronics-tv": tvFields,
  "electronics-photo": photoFields,
  "electronics-games": gamesFields,
  "electronics-appliances": applianceFields,
  "home-furniture": furnitureFields,
  "home-repair": repairFields,
  "home-garden": gardenFields,
  "fashion-clothing": fashionClothing,
  "fashion-shoes": fashionShoes,
  "fashion-accessories": fashionAcc,
  "kids-clothing": kidsClothing,
  "kids-toys": kidsToys,
  "kids-strollers": kidsStrollers,
  sport: sportFields,
  "services-it": servicesIt,
  "services-beauty": servicesBeauty,
  "services-transport": servicesTransport,
  jobs: jobsFields,
  animals: animalsFields,
  business: businessFields,
  other: [],
};

export function getDetailFieldsForSlug(slug: string): DetailField[] {
  return BY_SLUG[slug] ?? [];
}

/** Nume câmp în formular: coloană Prisma sau `d_<jsonKey>`. */
export function getDetailFormName(field: DetailField): string {
  if (field.storage.kind === "column") {
    return field.storage.column;
  }
  return `d_${field.storage.jsonKey}`;
}

export type SanitizedListingColumns = {
  brand: string | null;
  modelName: string | null;
  year: number | null;
  mileageKm: number | null;
  rooms: string | null;
  areaSqm: number | null;
};

export function sanitizeColumnPayload(
  slug: string,
  raw: {
    brand?: string | null;
    modelName?: string | null;
    year?: number | null;
    mileageKm?: number | null;
    rooms?: string | null;
    areaSqm?: number | null;
  },
): SanitizedListingColumns {
  const fields = getDetailFieldsForSlug(slug);
  const allowed = new Set<ColumnName>();
  for (const f of fields) {
    if (f.storage.kind === "column") {
      allowed.add(f.storage.column);
    }
  }
  const out: SanitizedListingColumns = {
    brand: null,
    modelName: null,
    year: null,
    mileageKm: null,
    rooms: null,
    areaSqm: null,
  };
  if (allowed.has("brand") && raw.brand != null) {
    const t = String(raw.brand).trim();
    out.brand = t === "" ? null : t;
  }
  if (allowed.has("modelName") && raw.modelName != null) {
    const t = String(raw.modelName).trim();
    out.modelName = t === "" ? null : t;
  }
  if (allowed.has("year") && raw.year != null && typeof raw.year === "number") {
    out.year = raw.year;
  }
  if (allowed.has("mileageKm") && raw.mileageKm != null && typeof raw.mileageKm === "number") {
    out.mileageKm = raw.mileageKm;
  }
  if (allowed.has("rooms") && raw.rooms != null) {
    const t = String(raw.rooms).trim();
    out.rooms = t === "" ? null : t;
  }
  if (allowed.has("areaSqm") && raw.areaSqm != null && typeof raw.areaSqm === "number") {
    out.areaSqm = raw.areaSqm;
  }
  return out;
}

export function parseDetailsJsonFromForm(
  slug: string,
  get: (name: string) => FormDataEntryValue | null,
): Record<string, string | number> | null {
  const fields = getDetailFieldsForSlug(slug).filter((f) => f.storage.kind === "json");
  const out: Record<string, string | number> = {};
  for (const f of fields) {
    if (f.storage.kind !== "json") {
      continue;
    }
    const key = f.storage.jsonKey;
    const raw = get(`d_${key}`);
    if (raw === null || raw === undefined) {
      continue;
    }
    const s = String(raw).trim();
    if (s === "") {
      continue;
    }
    if (f.input === "number") {
      const n = Number(s);
      if (!Number.isFinite(n)) {
        continue;
      }
      let v = n;
      if (f.min !== undefined) {
        v = Math.max(f.min, v);
      }
      if (f.max !== undefined) {
        v = Math.min(f.max, v);
      }
      out[key] = v;
    } else if (f.input === "select") {
      if (f.selectValues?.includes(s)) {
        out[key] = s;
      }
    } else {
      let t = s;
      if (f.maxLength && t.length > f.maxLength) {
        t = t.slice(0, f.maxLength);
      }
      out[key] = t;
    }
  }
  return Object.keys(out).length ? out : null;
}

export type ListingSpecsSource = {
  brand: string | null;
  modelName: string | null;
  year: number | null;
  mileageKm: number | null;
  rooms: string | null;
  areaSqm: number | null;
  detailsJson: string | null;
};

export function parseListingDetailsJson(raw: string | null): Record<string, unknown> {
  if (!raw) {
    return {};
  }
  try {
    const v = JSON.parse(raw) as unknown;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function formatColumnCell(field: DetailField, val: unknown, locale: string): string {
  if (field.storage.kind !== "column") {
    return "";
  }
  const c = field.storage.column;
  if (c === "mileageKm" && typeof val === "number") {
    return `${val.toLocaleString(locale)} km`;
  }
  if (c === "areaSqm" && typeof val === "number") {
    return `${val.toLocaleString(locale)} m²`;
  }
  if (c === "year" && typeof val === "number") {
    return String(val);
  }
  return String(val);
}

/** Rânduri pentru pagina de detaliu anunț (etichete deja traduse). */
export function getListingSpecEntries(
  slug: string,
  listing: ListingSpecsSource,
  t: (key: string) => string,
  locale: string,
): { label: string; value: string }[] {
  const fields = getDetailFieldsForSlug(slug);
  const dj = parseListingDetailsJson(listing.detailsJson);
  const out: { label: string; value: string }[] = [];

  for (const f of fields) {
    if (f.storage.kind === "column") {
      const col = f.storage.column;
      const val = listing[col];
      if (val === null || val === undefined) {
        continue;
      }
      if (typeof val === "string" && val.trim() === "") {
        continue;
      }
      out.push({
        label: t(`details.${f.id}`),
        value: formatColumnCell(f, val, locale),
      });
    } else {
      const key = f.storage.jsonKey;
      const val = dj[key];
      if (val === null || val === undefined) {
        continue;
      }
      if (typeof val === "string" && val.trim() === "") {
        continue;
      }
      if (f.input === "select" && f.selectGroup && typeof val === "string") {
        out.push({
          label: t(`details.${f.id}`),
          value: t(`detailSelect.${f.selectGroup}.${val}`),
        });
      } else {
        const s = typeof val === "number" ? val.toLocaleString(locale) : String(val);
        out.push({
          label: t(`details.${f.id}`),
          value: s,
        });
      }
    }
  }
  return out;
}
