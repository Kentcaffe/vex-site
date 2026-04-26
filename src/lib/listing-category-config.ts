import {
  isElectronicsBrandSlug,
  isFashionSlug,
  isJobSlug,
  isMotoLikeSlug,
  isRealEstateSlug,
  isVehicleWithOdometer,
} from "@/lib/listing-profiles";

export type ListingCategoryKey = "auto" | "moto" | "imobiliare" | "electronice" | "haine" | "joburi";

export type ListingFieldId =
  | "brand"
  | "modelName"
  | "year"
  | "mileageKm"
  | "fuel"
  | "transmission"
  | "engineCc"
  | "engineType"
  | "propertyType"
  | "areaSqm"
  | "rooms"
  | "floor"
  | "furnished"
  | "condition"
  | "warranty"
  | "sizeLabel"
  | "salary"
  | "jobType"
  | "experienceYears";

export type ListingFieldConfig = {
  id: ListingFieldId;
  label: string;
  input: "select" | "number";
  options?: readonly string[];
  min?: number;
  max?: number;
};

type CategoryConfig = {
  fields: readonly ListingFieldConfig[];
  brands?: Record<string, readonly string[]>;
  subcategories?: Record<string, readonly string[]>;
};

const YES_NO_PARTIAL = ["yes", "no", "partial"] as const;
const FUEL_OPTIONS = ["benzina", "diesel", "hibrid", "electric", "gpl", "altul"] as const;
const TRANSMISSION_OPTIONS = ["manuala", "automata", "semi-automata"] as const;
const ENGINE_TYPES = ["2t", "4t", "electric"] as const;
const PROPERTY_TYPES = ["apartament", "casa", "spatiu-comercial", "teren", "alta"] as const;
const FLOOR_OPTIONS = ["parter", "1", "2", "3", "4", "5+", "ultimul", "mansarda"] as const;
const PRODUCT_CONDITION = ["nou", "folosit", "refurbished"] as const;
const WARRANTY_OPTIONS = ["fara", "3-luni", "6-luni", "12-luni", "24-luni+"] as const;
const CLOTHES_SIZE = ["XS", "S", "M", "L", "XL", "XXL", "alta"] as const;
const JOB_TYPES = ["full-time", "part-time", "remote", "contract", "internship"] as const;

export const categoryConfig: Record<ListingCategoryKey, CategoryConfig> = {
  auto: {
    fields: [
      { id: "brand", label: "Marca", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "year", label: "An", input: "number", min: 1950, max: 2030 },
      { id: "mileageKm", label: "Kilometraj", input: "number", min: 0, max: 9_999_999 },
      { id: "fuel", label: "Combustibil", input: "select", options: FUEL_OPTIONS },
      { id: "transmission", label: "Transmisie", input: "select", options: TRANSMISSION_OPTIONS },
    ],
    brands: {
      BMW: ["X5", "X6", "Seria 3"],
      Audi: ["A4", "A6"],
      Mercedes: ["C Class", "E Class"],
    },
    subcategories: {
      auto: ["autovehicule", "camioane", "electrice"],
    },
  },
  moto: {
    fields: [
      { id: "brand", label: "Marca", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "year", label: "An", input: "number", min: 1950, max: 2030 },
      { id: "engineCc", label: "Cilindree", input: "number", min: 50, max: 3000 },
      { id: "mileageKm", label: "Kilometraj", input: "number", min: 0, max: 9_999_999 },
      { id: "engineType", label: "Tip motor", input: "select", options: ENGINE_TYPES },
    ],
    brands: {
      BMW: ["S1000RR", "R1250GS"],
      Yamaha: ["R1", "MT-07"],
      Honda: ["CBR600RR"],
    },
  },
  imobiliare: {
    fields: [
      { id: "propertyType", label: "Tip", input: "select", options: PROPERTY_TYPES },
      { id: "areaSqm", label: "Suprafață", input: "number", min: 1, max: 999_999_999 },
      { id: "rooms", label: "Camere", input: "number", min: 1, max: 100 },
      { id: "floor", label: "Etaj", input: "select", options: FLOOR_OPTIONS },
      { id: "furnished", label: "Mobilat", input: "select", options: YES_NO_PARTIAL },
    ],
  },
  electronice: {
    fields: [
      { id: "brand", label: "Brand", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "condition", label: "Stare", input: "select", options: PRODUCT_CONDITION },
      { id: "warranty", label: "Garanție", input: "select", options: WARRANTY_OPTIONS },
    ],
    brands: {
      Apple: ["iPhone 14", "iPhone 15", "MacBook Air"],
      Samsung: ["Galaxy S23", "Galaxy S24", "Galaxy Book"],
      Lenovo: ["ThinkPad X1", "Legion 5", "IdeaPad 5"],
    },
  },
  haine: {
    fields: [
      { id: "sizeLabel", label: "Mărime", input: "select", options: CLOTHES_SIZE },
      { id: "brand", label: "Brand", input: "select" },
      { id: "condition", label: "Stare", input: "select", options: PRODUCT_CONDITION },
    ],
    brands: {
      Nike: ["Air Max", "Tech Fleece"],
      Adidas: ["Originals", "Terrex"],
      Zara: ["Basic", "Premium"],
    },
  },
  joburi: {
    fields: [
      { id: "salary", label: "Salariu", input: "number", min: 0, max: 999_999_999 },
      { id: "jobType", label: "Tip job", input: "select", options: JOB_TYPES },
      { id: "experienceYears", label: "Experiență", input: "number", min: 0, max: 60 },
    ],
  },
};

export function resolveCategoryConfigKey(slug: string): ListingCategoryKey | null {
  if (!slug.trim()) {
    return null;
  }
  if (isMotoLikeSlug(slug)) {
    return "moto";
  }
  if (isVehicleWithOdometer(slug)) {
    return "auto";
  }
  if (isRealEstateSlug(slug)) {
    return "imobiliare";
  }
  if (isElectronicsBrandSlug(slug)) {
    return "electronice";
  }
  if (isFashionSlug(slug)) {
    return "haine";
  }
  if (isJobSlug(slug)) {
    return "joburi";
  }
  return null;
}

export function getCategoryBrands(key: ListingCategoryKey | null): string[] {
  if (!key) {
    return [];
  }
  return Object.keys(categoryConfig[key].brands ?? {});
}

export function getModelsForCategoryBrand(key: ListingCategoryKey | null, brand: string): string[] {
  if (!key || !brand.trim()) {
    return [];
  }
  const models = categoryConfig[key].brands?.[brand];
  return models ? [...models] : [];
}

export function isBrandAllowedForCategory(key: ListingCategoryKey | null, brand: string): boolean {
  const normalizedBrand = brand.trim();
  if (!normalizedBrand) {
    return true;
  }
  if (!key) {
    return true;
  }
  const brands = categoryConfig[key].brands;
  if (!brands) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(brands, normalizedBrand);
}

export function isModelAllowedForCategoryBrand(
  key: ListingCategoryKey | null,
  brand: string,
  model: string,
): boolean {
  const normalizedModel = model.trim();
  if (!normalizedModel) {
    return true;
  }
  if (!key) {
    return true;
  }
  const allowedModels = getModelsForCategoryBrand(key, brand);
  return allowedModels.includes(normalizedModel);
}
