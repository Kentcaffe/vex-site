/** Opțiuni reutilizabile pentru formulare dinamice (publicare + filtre). */

/** Valori `detailsJson` pentru autoturisme (aceeași sursă ca în formular). */
export const VEHICLE_FUEL_KEYS = ["petrol", "diesel", "electric", "hybrid", "lpg"] as const;

export const VEHICLE_TRANSMISSION_KEYS = ["manual", "automatic"] as const;

export const VEHICLE_BODY_TYPE_KEYS = [
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

export const VEHICLE_DRIVETRAIN_KEYS = ["fwd", "rwd", "awd", "4wd"] as const;

export const VEHICLE_DOOR_KEYS = ["2", "3", "4", "5"] as const;

export const LISTING_YEAR_OPTIONS: readonly string[] = (() => {
  const y = new Date().getFullYear();
  const from = Math.min(y + 1, 2030);
  const to = 1990;
  const out: string[] = [];
  for (let i = from; i >= to; i -= 1) {
    out.push(String(i));
  }
  return out;
})();

/** Volum motor (l) — valori tipice pentru select. */
export const ENGINE_LITER_OPTIONS = [
  "0.8",
  "1.0",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.8",
  "2.0",
  "2.2",
  "2.5",
  "3.0",
  "3.5",
  "4.0",
  "4.4",
  "5.0",
  "6.0",
  "electric",
] as const;

export const VEHICLE_SEAT_OPTIONS = ["2", "3", "4", "5", "6", "7", "8", "9"] as const;

/** Chei stabile pentru culoare (etichete în i18n). */
export const VEHICLE_COLOR_KEYS = [
  "white",
  "black",
  "gray",
  "silver",
  "blue",
  "red",
  "green",
  "brown",
  "orange",
  "yellow",
  "beige",
  "other",
] as const;

export const RE_PROPERTY_TYPES = ["apartment", "house", "studio", "land"] as const;

export const RE_ROOM_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;

export const RE_FLOOR_OPTIONS = [
  "basement",
  "ground",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21plus",
] as const;

export const RE_TOTAL_FLOORS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21plus",
] as const;

export const RE_PROPERTY_CONDITION = ["new", "good", "livable", "needs_renovation", "shell"] as const;

export const ELECTRONICS_PRODUCT_PHONE = ["smartphone", "classic_phone", "tablet", "smartwatch"] as const;

export const ELECTRONICS_PRODUCT_PC = ["laptop", "desktop", "monitor", "components", "peripherals", "other"] as const;

export const ELECTRONICS_CONDITION = ["new", "used", "refurbished"] as const;

export const STORAGE_GB_PHONE = ["16", "32", "64", "128", "256", "512", "1024"] as const;

export const STORAGE_GB_LAPTOP = ["128", "256", "512", "1024", "2048"] as const;

export const RAM_GB_PHONE = ["2", "3", "4", "6", "8", "12", "16", "18", "24"] as const;

export const RAM_GB_LAPTOP = ["4", "8", "16", "32", "64"] as const;

export const SCREEN_INCH_BUCKETS = ["11", "12", "13", "14", "15.6", "16", "17", "18", "21", "24", "27", "32"] as const;

/** Valori `property_type` din JSON (inclusiv terenuri). */
export const RE_PROPERTY_TYPE_FILTER = [...RE_PROPERTY_TYPES, "forest", "agricultural"] as const;

export const RE_FURNISHED_VALUES = ["yes", "no", "partial"] as const;

export const ELECTRONICS_PRODUCT_ALL = [...ELECTRONICS_PRODUCT_PHONE, ...ELECTRONICS_PRODUCT_PC] as const;

/** Opțiuni stocare pentru filtre (telefon + laptop). */
export const STORAGE_GB_FILTER_VALUES: readonly string[] = Array.from(
  new Set([...STORAGE_GB_PHONE, ...STORAGE_GB_LAPTOP]),
).sort((a, b) => Number(a) - Number(b));
