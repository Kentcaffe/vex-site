import type { Listing } from "@prisma/client";
import {
  ELECTRONICS_CONDITION,
  ELECTRONICS_PRODUCT_PC,
  ELECTRONICS_PRODUCT_PHONE,
  ENGINE_LITER_OPTIONS,
  RAM_GB_LAPTOP,
  RAM_GB_PHONE,
  RE_FLOOR_OPTIONS,
  RE_PROPERTY_CONDITION,
  RE_PROPERTY_TYPES,
  RE_TOTAL_FLOORS,
  SCREEN_INCH_BUCKETS,
  STORAGE_GB_LAPTOP,
  STORAGE_GB_PHONE,
  VEHICLE_BODY_TYPE_KEYS,
  VEHICLE_COLOR_KEYS,
  VEHICLE_DOOR_KEYS,
  VEHICLE_DRIVETRAIN_KEYS,
  VEHICLE_FUEL_KEYS,
  VEHICLE_SEAT_OPTIONS,
  VEHICLE_TRANSMISSION_KEYS,
} from "@/lib/listing-form-options";
import {
  isAnimalSlug,
  isBrandModelOnlySlug,
  isFashionSlug,
  isJobSlug,
  isLaptopPcSlug,
  isMotoLikeSlug,
  isPhoneTabletSlug,
  isRealEstateSlug,
  isServiceJobLeafSlug,
  isVehicleWithOdometer,
} from "@/lib/listing-profiles";
import { getGenerationOptions } from "@/lib/vehicle-generations";
import listingDynamicFields from "@/config/listing-dynamic-fields.json";

const KNOWN_DETAIL_KEYS: Record<string, string> = {
  fuel: "specExtra.fuel",
  transmission: "specExtra.transmission",
  color: "specExtra.color",
  floor: "specExtra.floor",
  storage_gb: "specExtra.storage_gb",
  ram_gb: "specExtra.ram_gb",
  experience_years: "specExtra.experience_years",
  service_radius_km: "specExtra.service_radius_km",
  body_type: "specExtra.body_type",
  drivetrain: "specExtra.drivetrain",
  engine_cc: "specExtra.engine_cc",
  engine_l: "specExtra.engine_l",
  power_hp: "specExtra.power_hp",
  doors: "specExtra.doors",
  seats: "specExtra.seats",
  generation: "specExtra.generation",
  furnished: "specExtra.furnished",
  building_type: "specExtra.building_type",
  land_area_sqm: "specExtra.land_area_sqm",
  property_type: "specExtra.property_type",
  total_floors: "specExtra.total_floors",
  property_condition: "specExtra.property_condition",
  product_type: "specExtra.product_type",
  electronics_condition: "specExtra.electronics_condition",
  battery_health: "specExtra.battery_health",
  screen_inch: "specExtra.screen_inch",
  processor: "specExtra.processor",
  part_number: "specExtra.part_number",
  compatibility: "specExtra.compatibility",
  employment_type: "specExtra.employment_type",
  salary_from: "specExtra.salary_from",
  salary_to: "specExtra.salary_to",
  size_label: "specExtra.size_label",
  age_months: "specExtra.age_months",
  vaccinated: "specExtra.vaccinated",
};

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type ListingSpecsSource = Pick<
  Listing,
  "brand" | "modelName" | "year" | "mileageKm" | "rooms" | "areaSqm" | "detailsJson"
>;

export type DetailField = {
  id: string;
  input: "text" | "number" | "select";
  selectValues?: string[];
  selectGroup?: string;
  /** Listă lungă: combobox cu căutare în formularul de publicare */
  searchable?: boolean;
  min?: number;
  max?: number;
  numberStep?: string;
  maxLength?: number;
};

export type SpecRow = {
  label: string;
  value: string;
  /** Cheie din detailsJson — pentru traducerea valorii în UI */
  detailKey?: string;
};

export function getDetailFormName(field: DetailField): string {
  return `d_${field.id}`;
}

const FURNISHED = ["yes", "no", "partial"] as const;
const BUILDING = ["block", "house", "new_build", "other"] as const;
const EMPLOYMENT = ["full_time", "part_time", "contract", "remote", "internship"] as const;
const VACC = ["yes", "no", "unknown"] as const;

const DETAIL_OPTION_REGISTRY: Record<string, readonly string[]> = {
  VEHICLE_FUEL_KEYS: [...VEHICLE_FUEL_KEYS],
  VEHICLE_TRANSMISSION_KEYS: [...VEHICLE_TRANSMISSION_KEYS],
  VEHICLE_COLOR_KEYS: [...VEHICLE_COLOR_KEYS],
  ENGINE_LITER_OPTIONS: [...ENGINE_LITER_OPTIONS],
  VEHICLE_BODY_TYPE_KEYS: [...VEHICLE_BODY_TYPE_KEYS],
  VEHICLE_DRIVETRAIN_KEYS: [...VEHICLE_DRIVETRAIN_KEYS],
  VEHICLE_DOOR_KEYS: [...VEHICLE_DOOR_KEYS],
  VEHICLE_SEAT_OPTIONS: [...VEHICLE_SEAT_OPTIONS],
  RE_PROPERTY_TYPES: [...RE_PROPERTY_TYPES],
  RE_FLOOR_OPTIONS: [...RE_FLOOR_OPTIONS],
  RE_TOTAL_FLOORS: [...RE_TOTAL_FLOORS],
  RE_PROPERTY_CONDITION: [...RE_PROPERTY_CONDITION],
  FURNISHED: [...FURNISHED],
  BUILDING: [...BUILDING],
  ELECTRONICS_PRODUCT_PHONE: [...ELECTRONICS_PRODUCT_PHONE],
  ELECTRONICS_PRODUCT_PC: [...ELECTRONICS_PRODUCT_PC],
  ELECTRONICS_CONDITION: [...ELECTRONICS_CONDITION],
  STORAGE_GB_PHONE: [...STORAGE_GB_PHONE],
  STORAGE_GB_LAPTOP: [...STORAGE_GB_LAPTOP],
  RAM_GB_PHONE: [...RAM_GB_PHONE],
  RAM_GB_LAPTOP: [...RAM_GB_LAPTOP],
  SCREEN_INCH_BUCKETS: [...SCREEN_INCH_BUCKETS],
  EMPLOYMENT: [...EMPLOYMENT],
  VACC: [...VACC],
};

type JsonExtraDetailRow = {
  name: string;
  type: "select" | "number" | "text";
  optionsRef?: string;
  optionsInline?: string[];
  dynamic?: string;
  selectGroup?: string;
  searchable?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  appliesToSlug?: string;
};

const EXTRA_DETAIL_PREDICATES: Record<string, (slug: string) => boolean> = {
  moto_vehicle: (s) => isVehicleWithOdometer(s) && isMotoLikeSlug(s),
  vehicle_car: (s) => isVehicleWithOdometer(s) && !isMotoLikeSlug(s),
  transport_parts: (s) => /^transport-(piese|accesorii|scule)-/.test(s),
  real_estate_land: (s) => isRealEstateSlug(s) && /teren|padure|agricol/.test(s),
  real_estate_building: (s) => isRealEstateSlug(s) && !/teren|padure|agricol/.test(s),
  electronics_phone: (s) => isPhoneTabletSlug(s),
  electronics_pc: (s) => isLaptopPcSlug(s),
  service_leaf: (s) => isServiceJobLeafSlug(s),
  job: (s) => isJobSlug(s),
  fashion: (s) => isFashionSlug(s),
  animal: (s) => isAnimalSlug(s),
};

function resolveExtraDetailTemplateKey(slug: string): string | null {
  const rules = (
    listingDynamicFields as {
      extraDetail: { rules: { template: string; predicate: string }[] };
    }
  ).extraDetail.rules;
  for (const r of rules) {
    const fn = EXTRA_DETAIL_PREDICATES[r.predicate];
    if (fn?.(slug)) {
      return r.template;
    }
  }
  return null;
}

function materializeExtraDetailFields(
  templateKey: string,
  slug: string,
  ctx?: { brand?: string; model?: string },
): DetailField[] {
  const rows = (
    listingDynamicFields as {
      extraDetail: { templates: Record<string, JsonExtraDetailRow[]> };
    }
  ).extraDetail.templates[templateKey];
  if (!rows?.length) {
    return [];
  }
  const out: DetailField[] = [];
  for (const row of rows) {
    if (row.appliesToSlug && !new RegExp(row.appliesToSlug).test(slug)) {
      continue;
    }
    let selectValues: string[] | undefined;
    if (row.dynamic === "vehicle_generations") {
      const brand = ctx?.brand ?? "";
      const model = ctx?.model ?? "";
      const gens = getGenerationOptions(brand, model).filter((g) => g !== "n_a");
      selectValues = [...(gens.length ? gens : ["n_a"])];
    } else if (row.optionsRef) {
      const src = DETAIL_OPTION_REGISTRY[row.optionsRef];
      if (src) {
        selectValues = [...src];
      }
    } else if (row.optionsInline?.length) {
      selectValues = [...row.optionsInline];
    }
    const input: DetailField["input"] = row.type === "text" ? "text" : row.type === "number" ? "number" : "select";
    out.push({
      id: row.name,
      input,
      ...(selectValues ? { selectValues } : {}),
      ...(row.selectGroup ? { selectGroup: row.selectGroup } : {}),
      ...(row.searchable ? { searchable: true } : {}),
      ...(typeof row.min === "number" ? { min: row.min } : {}),
      ...(typeof row.max === "number" ? { max: row.max } : {}),
      ...(typeof row.maxLength === "number" ? { maxLength: row.maxLength } : {}),
    });
  }
  return out;
}

export function getListingFormFlags(slug: string): {
  isVeh: boolean;
  isRe: boolean;
  isBrandish: boolean;
} {
  return {
    isVeh: isVehicleWithOdometer(slug),
    isRe: isRealEstateSlug(slug),
    isBrandish: isBrandModelOnlySlug(slug),
  };
}

export function getDetailFieldsForSlug(slug: string, ctx?: { brand?: string; model?: string }): DetailField[] {
  const templateKey = resolveExtraDetailTemplateKey(slug);
  if (!templateKey) {
    return [];
  }
  return materializeExtraDetailFields(templateKey, slug, ctx);
}

export function parseDetailsJsonFromForm(
  slug: string,
  get: (name: string) => FormDataEntryValue | null,
): string | null {
  const fields = getDetailFieldsForSlug(slug);
  const obj: Record<string, string | number> = {};
  let any = false;
  for (const f of fields) {
    const name = getDetailFormName(f);
    const v = get(name);
    if (v == null || v === "") {
      continue;
    }
    const s = String(v).trim();
    if (!s) {
      continue;
    }
    if (s === "n_a") {
      continue;
    }
    if (f.input === "number") {
      const n = Number(s);
      if (Number.isFinite(n)) {
        obj[f.id] = n;
        any = true;
      }
    } else {
      obj[f.id] = s;
      any = true;
    }
  }
  return any ? JSON.stringify(obj) : null;
}

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
): {
  brand: string | null;
  modelName: string | null;
  year: number | null;
  mileageKm: number | null;
  rooms: string | null;
  areaSqm: number | null;
} {
  const z = (s: string | null | undefined) => (s?.trim() ? s.trim() : null);
  const n = (x: number | null | undefined) => (typeof x === "number" && Number.isFinite(x) ? x : null);

  const veh = isVehicleWithOdometer(slug);
  const re = isRealEstateSlug(slug);
  const brandish = isBrandModelOnlySlug(slug);

  return {
    brand: veh || brandish ? z(raw.brand) : null,
    modelName: veh || brandish ? z(raw.modelName) : null,
    year: veh ? n(raw.year) : null,
    mileageKm: veh ? n(raw.mileageKm) : null,
    rooms: re ? z(raw.rooms) : null,
    areaSqm: re ? n(raw.areaSqm) : null,
  };
}

export function getListingSpecEntries(
  categorySlug: string,
  listing: ListingSpecsSource,
  tDetail: (key: string) => string,
): SpecRow[] {
  const rows: SpecRow[] = [];

  const add = (labelKey: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return;
    }
    rows.push({ label: tDetail(labelKey), value: String(value) });
  };

  add("spec.brand", listing.brand);
  add("spec.model", listing.modelName);
  add("spec.year", listing.year);
  add("spec.mileageKm", listing.mileageKm);
  add("spec.rooms", listing.rooms);
  add("spec.areaSqm", listing.areaSqm);

  const allowedDetailKeys = new Set(getDetailFieldsForSlug(categorySlug).map((f) => f.id));

  if (listing.detailsJson) {
    try {
      const obj = JSON.parse(listing.detailsJson) as Record<string, unknown>;
      for (const [key, raw] of Object.entries(obj)) {
        if (!allowedDetailKeys.has(key)) {
          continue;
        }
        if (raw === null || raw === undefined || raw === "") {
          continue;
        }
        const sv = String(raw);
        if (sv === "n_a") {
          continue;
        }
        const mapped = Object.prototype.hasOwnProperty.call(KNOWN_DETAIL_KEYS, key)
          ? KNOWN_DETAIL_KEYS[key]
          : undefined;
        const label = mapped ? tDetail(mapped) : humanizeKey(key);
        rows.push({ label, value: sv, detailKey: key });
      }
    } catch {
      /* ignore */
    }
  }

  return rows;
}
