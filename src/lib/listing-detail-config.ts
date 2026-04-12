import type { Listing } from "@prisma/client";

const KNOWN_DETAIL_KEYS: Record<string, string> = {
  fuel: "specExtra.fuel",
  transmission: "specExtra.transmission",
  color: "specExtra.color",
  floor: "specExtra.floor",
  storage_gb: "specExtra.storage_gb",
  ram_gb: "specExtra.ram_gb",
  experience_years: "specExtra.experience_years",
  service_radius_km: "specExtra.service_radius_km",
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

export function getDetailFieldsForSlug(slug: string): DetailField[] {
  if (slug === "auto" || slug === "moto") {
    return [
      {
        id: "fuel",
        input: "select",
        selectGroup: "fuel",
        selectValues: ["petrol", "diesel", "electric", "hybrid", "lpg"],
      },
      {
        id: "transmission",
        input: "select",
        selectGroup: "transmission",
        selectValues: ["manual", "automatic"],
      },
    ];
  }
  if (slug === "apartamente" || slug === "case") {
    return [{ id: "floor", input: "text", maxLength: 40 }];
  }
  if (slug === "telefoane" || slug === "laptop") {
    return [
      { id: "storage_gb", input: "number", min: 1, max: 2048 },
      { id: "ram_gb", input: "number", min: 1, max: 128 },
    ];
  }
  if (slug === "reparatii-auto") {
    return [
      { id: "experience_years", input: "number", min: 0, max: 60 },
      { id: "service_radius_km", input: "number", min: 1, max: 500 },
    ];
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
  const isVeh = slug === "auto" || slug === "moto";
  const isRe = slug === "apartamente" || slug === "case";
  const brandish = ["piese-auto", "telefoane", "laptop", "haine"].includes(slug);
  return {
    brand: isVeh || brandish ? z(raw.brand) : null,
    modelName: isVeh || brandish ? z(raw.modelName) : null,
    year: isVeh ? n(raw.year) : null,
    mileageKm: isVeh ? n(raw.mileageKm) : null,
    rooms: isRe ? z(raw.rooms) : null,
    areaSqm: isRe ? n(raw.areaSqm) : null,
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
