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

function vehicleDetailsForSlug(slug: string, ctx?: { brand?: string; model?: string }): DetailField[] {
  const moto = isMotoLikeSlug(slug);
  if (moto) {
    return [
      { id: "fuel", input: "select", selectGroup: "fuel", selectValues: [...VEHICLE_FUEL_KEYS] },
      { id: "transmission", input: "select", selectGroup: "transmission", selectValues: [...VEHICLE_TRANSMISSION_KEYS] },
      { id: "color", input: "select", selectValues: [...VEHICLE_COLOR_KEYS], searchable: true },
      { id: "engine_cc", input: "number", min: 50, max: 3000 },
    ];
  }
  const brand = ctx?.brand ?? "";
  const model = ctx?.model ?? "";
  const gens = getGenerationOptions(brand, model).filter((g) => g !== "n_a");
  const genValues = gens.length ? gens : ["n_a"];
  return [
    { id: "generation", input: "select", selectValues: genValues },
    { id: "fuel", input: "select", selectGroup: "fuel", selectValues: [...VEHICLE_FUEL_KEYS] },
    { id: "engine_l", input: "select", selectValues: [...ENGINE_LITER_OPTIONS] },
    { id: "transmission", input: "select", selectGroup: "transmission", selectValues: [...VEHICLE_TRANSMISSION_KEYS] },
    { id: "body_type", input: "select", selectValues: [...VEHICLE_BODY_TYPE_KEYS], searchable: true },
    { id: "drivetrain", input: "select", selectValues: [...VEHICLE_DRIVETRAIN_KEYS] },
    { id: "doors", input: "select", selectValues: [...VEHICLE_DOOR_KEYS] },
    { id: "seats", input: "select", selectValues: [...VEHICLE_SEAT_OPTIONS] },
    { id: "color", input: "select", selectValues: [...VEHICLE_COLOR_KEYS], searchable: true },
  ];
}

function partsAccessoryDetails(): DetailField[] {
  return [
    { id: "part_number", input: "text", maxLength: 80 },
    { id: "compatibility", input: "text", maxLength: 160 },
  ];
}

function realEstateDetails(slug: string): DetailField[] {
  if (/teren|padure|agricol/.test(slug)) {
    return [
      { id: "property_type", input: "select", selectValues: ["land", "forest", "agricultural"] },
      { id: "land_area_sqm", input: "number", min: 1, max: 999_999_999 },
    ];
  }
  const out: DetailField[] = [
    { id: "property_type", input: "select", selectValues: [...RE_PROPERTY_TYPES] },
    { id: "floor", input: "select", selectValues: [...RE_FLOOR_OPTIONS] },
    { id: "total_floors", input: "select", selectValues: [...RE_TOTAL_FLOORS] },
    { id: "property_condition", input: "select", selectValues: [...RE_PROPERTY_CONDITION] },
    { id: "furnished", input: "select", selectValues: [...FURNISHED] },
  ];
  if (/apartament|garsonier|case-/.test(slug) || slug === "apartamente" || slug === "case") {
    out.push({ id: "building_type", input: "select", selectValues: [...BUILDING] });
  }
  return out;
}

function electronicsDetails(slug: string): DetailField[] {
  const phone = isPhoneTabletSlug(slug);
  const products = phone ? [...ELECTRONICS_PRODUCT_PHONE] : [...ELECTRONICS_PRODUCT_PC];
  const storageOpts = phone ? [...STORAGE_GB_PHONE] : [...STORAGE_GB_LAPTOP];
  const ramOpts = phone ? [...RAM_GB_PHONE] : [...RAM_GB_LAPTOP];
  const base: DetailField[] = [
    { id: "product_type", input: "select", selectValues: products },
    { id: "electronics_condition", input: "select", selectValues: [...ELECTRONICS_CONDITION] },
    { id: "storage_gb", input: "select", selectValues: storageOpts, searchable: true },
  ];
  if (!phone) {
    base.push(
      { id: "ram_gb", input: "select", selectValues: ramOpts, searchable: true },
      { id: "screen_inch", input: "select", selectValues: [...SCREEN_INCH_BUCKETS] },
    );
  } else {
    base.push({ id: "ram_gb", input: "select", selectValues: ramOpts, searchable: true });
  }
  base.push({ id: "color", input: "select", selectValues: [...VEHICLE_COLOR_KEYS], searchable: true });
  return base;
}

function serviceDetails(): DetailField[] {
  return [
    { id: "experience_years", input: "number", min: 0, max: 60 },
    { id: "service_radius_km", input: "number", min: 1, max: 500 },
  ];
}

function jobDetails(): DetailField[] {
  return [
    { id: "employment_type", input: "select", selectValues: [...EMPLOYMENT] },
    { id: "salary_from", input: "number", min: 0, max: 999_999_999 },
    { id: "salary_to", input: "number", min: 0, max: 999_999_999 },
  ];
}

function fashionDetails(): DetailField[] {
  return [
    { id: "size_label", input: "text", maxLength: 24 },
    { id: "color", input: "text", maxLength: 40 },
  ];
}

function animalDetails(): DetailField[] {
  return [
    { id: "age_months", input: "number", min: 0, max: 360 },
    { id: "vaccinated", input: "select", selectValues: [...VACC] },
  ];
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
  if (isVehicleWithOdometer(slug)) {
    return vehicleDetailsForSlug(slug, ctx);
  }
  if (/^transport-(piese|accesorii|scule)-/.test(slug)) {
    return partsAccessoryDetails();
  }
  if (isRealEstateSlug(slug)) {
    return realEstateDetails(slug);
  }
  if (isPhoneTabletSlug(slug) || isLaptopPcSlug(slug)) {
    return electronicsDetails(slug);
  }
  if (isServiceJobLeafSlug(slug)) {
    return serviceDetails();
  }
  if (isJobSlug(slug)) {
    return jobDetails();
  }
  if (isFashionSlug(slug)) {
    return fashionDetails();
  }
  if (isAnimalSlug(slug)) {
    return animalDetails();
  }
  return [];
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
