import type { Listing } from "@prisma/client";
import {
  isAnimalSlug,
  isFashionSlug,
  isJobSlug,
  isLaptopPcSlug,
  isMotoLikeSlug,
  isPhoneTabletSlug,
  isRealEstateSlug,
  isServiceJobLeafSlug,
  isVehicleWithOdometer,
  isBrandModelOnlySlug,
} from "@/lib/listing-profiles";

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
  power_hp: "specExtra.power_hp",
  doors: "specExtra.doors",
  furnished: "specExtra.furnished",
  building_type: "specExtra.building_type",
  land_area_sqm: "specExtra.land_area_sqm",
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
  min?: number;
  max?: number;
  numberStep?: string;
  maxLength?: number;
};

export function getDetailFormName(field: DetailField): string {
  return `d_${field.id}`;
}

const FUEL = ["petrol", "diesel", "electric", "hybrid", "lpg"] as const;
const TRANSMISSION = ["manual", "automatic"] as const;
const BODY_CAR = [
  "sedan",
  "hatchback",
  "suv",
  "mpv",
  "coupe",
  "convertible",
  "wagon",
  "pickup",
  "van",
  "other",
] as const;
const DRIVETRAIN = ["fwd", "rwd", "awd", "4wd"] as const;
const DOORS = ["2", "3", "4", "5"] as const;
const FURNISHED = ["yes", "no", "partial"] as const;
const BUILDING = ["block", "house", "new_build", "other"] as const;
const EMPLOYMENT = ["full_time", "part_time", "contract", "remote", "internship"] as const;
const VACC = ["yes", "no", "unknown"] as const;

function vehicleDetailsForSlug(slug: string): DetailField[] {
  const moto = isMotoLikeSlug(slug);
  const base: DetailField[] = [
    { id: "fuel", input: "select", selectGroup: "fuel", selectValues: [...FUEL] },
    { id: "transmission", input: "select", selectGroup: "transmission", selectValues: [...TRANSMISSION] },
    { id: "color", input: "text", maxLength: 40 },
    { id: "engine_cc", input: "number", min: 0, max: 20000 },
  ];
  if (!moto) {
    base.push(
      { id: "body_type", input: "select", selectValues: [...BODY_CAR] },
      { id: "drivetrain", input: "select", selectValues: [...DRIVETRAIN] },
      { id: "power_hp", input: "number", min: 1, max: 3000 },
      { id: "doors", input: "select", selectValues: [...DOORS] },
    );
  }
  return base;
}

function partsAccessoryDetails(): DetailField[] {
  return [
    { id: "part_number", input: "text", maxLength: 80 },
    { id: "compatibility", input: "text", maxLength: 160 },
  ];
}

function realEstateDetails(slug: string): DetailField[] {
  if (/teren|padure|agricol/.test(slug)) {
    return [{ id: "land_area_sqm", input: "number", min: 1, max: 999_999_999 }];
  }
  const out: DetailField[] = [
    { id: "furnished", input: "select", selectValues: [...FURNISHED] },
    { id: "floor", input: "text", maxLength: 40 },
  ];
  if (/apartament|garsonier|case-/.test(slug) || slug === "apartamente" || slug === "case") {
    out.push({ id: "building_type", input: "select", selectValues: [...BUILDING] });
  }
  return out;
}

function phoneDetails(): DetailField[] {
  return [
    { id: "storage_gb", input: "number", min: 1, max: 2048 },
    { id: "ram_gb", input: "number", min: 1, max: 32 },
    { id: "battery_health", input: "number", min: 0, max: 100 },
    { id: "color", input: "text", maxLength: 40 },
  ];
}

function laptopDetails(): DetailField[] {
  return [
    { id: "storage_gb", input: "number", min: 1, max: 8192 },
    { id: "ram_gb", input: "number", min: 1, max: 128 },
    { id: "screen_inch", input: "number", min: 10, max: 22 },
    { id: "processor", input: "text", maxLength: 100 },
  ];
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

export function getDetailFieldsForSlug(slug: string): DetailField[] {
  if (isVehicleWithOdometer(slug)) {
    return vehicleDetailsForSlug(slug);
  }
  if (/^transport-(piese|accesorii|scule)-/.test(slug)) {
    return partsAccessoryDetails();
  }
  if (isRealEstateSlug(slug)) {
    return realEstateDetails(slug);
  }
  if (isPhoneTabletSlug(slug)) {
    return phoneDetails();
  }
  if (isLaptopPcSlug(slug)) {
    return laptopDetails();
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
  _categorySlug: string,
  listing: ListingSpecsSource,
  tDetail: (key: string) => string,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];

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

  if (listing.detailsJson) {
    try {
      const obj = JSON.parse(listing.detailsJson) as Record<string, unknown>;
      for (const [key, raw] of Object.entries(obj)) {
        if (raw === null || raw === undefined || raw === "") {
          continue;
        }
        const mapped = Object.prototype.hasOwnProperty.call(KNOWN_DETAIL_KEYS, key)
          ? KNOWN_DETAIL_KEYS[key]
          : undefined;
        const label = mapped ? tDetail(mapped) : humanizeKey(key);
        rows.push({ label, value: String(raw) });
      }
    } catch {
      /* ignore */
    }
  }

  return rows;
}
