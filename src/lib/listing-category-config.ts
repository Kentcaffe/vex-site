import {
  isElectronicsBrandSlug,
  isFashionSlug,
  isJobSlug,
  isMotoLikeSlug,
  isRealEstateSlug,
  isVehicleWithOdometer,
} from "@/lib/listing-profiles";
import { getModelsForBrand } from "@/lib/vehicle-models-by-brand";
import { VEHICLE_BRANDS } from "@/lib/vehicle-taxonomy";

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
  | "experienceYears"
  | "bodyType"
  | "drivetrain"
  | "doors"
  | "seats"
  | "color"
  | "powerHp"
  | "registrationCountry"
  | "serviceHistory"
  | "accidentFree"
  | "numberOfOwners"
  | "buildYear"
  | "landAreaSqm"
  | "totalFloors"
  | "balconies"
  | "bathrooms"
  | "heatingType"
  | "parkingType"
  | "energyClass"
  | "productType"
  | "storageGb"
  | "ramGb"
  | "screenInch"
  | "batteryHealth"
  | "processorType"
  | "videoCard"
  | "material"
  | "forGender"
  | "season"
  | "colorway"
  | "workSchedule"
  | "educationLevel"
  | "languageLevel"
  | "contractDurationMonths"
  | "remotePolicy"
  | "vin"
  | "emissionClass"
  | "wheelDriveType"
  | "batteryCapacityKwh"
  | "rangeKm"
  | "fastCharge"
  | "cargoVolumeM3"
  | "payloadKg"
  | "axlesCount"
  | "livingAreaSqm"
  | "kitchenAreaSqm"
  | "renovationType"
  | "availableFrom"
  | "petsAllowed"
  | "elevator"
  | "internet"
  | "smartFeatures"
  | "refreshRateHz"
  | "cameraMp"
  | "simType"
  | "osType"
  | "connectivity"
  | "originalBox"
  | "waterResistance"
  | "fitType"
  | "waistCm"
  | "lengthCm"
  | "shoeSizeEu"
  | "companyType"
  | "industry"
  | "positionsOpen"
  | "benefits"
  | "driverLicenseRequired";

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
const FUEL_OPTIONS = ["petrol", "diesel", "hybrid", "electric", "lpg", "other"] as const;
const TRANSMISSION_OPTIONS = ["manual", "automatic", "semi-automatic"] as const;
const ENGINE_TYPES = ["2t", "4t", "electric"] as const;
const PROPERTY_TYPES = ["apartment", "house", "commercial-space", "land", "other"] as const;
const FLOOR_OPTIONS = ["ground-floor", "1", "2", "3", "4", "5+", "top-floor", "attic"] as const;
const PRODUCT_CONDITION = ["new", "used", "refurbished"] as const;
const WARRANTY_OPTIONS = ["none", "3-months", "6-months", "12-months", "24-months+"] as const;
const CLOTHES_SIZE = ["XS", "S", "M", "L", "XL", "XXL", "other"] as const;
const JOB_TYPES = ["full-time", "part-time", "remote", "contract", "internship"] as const;
const BODY_TYPES = ["sedan", "hatchback", "suv", "coupe", "wagon", "pickup", "van", "convertible"] as const;
const DOORS_OPTIONS = ["2", "3", "4", "5"] as const;
const SEATS_OPTIONS = ["2", "4", "5", "7", "8", "9"] as const;
const COLOR_OPTIONS = [
  "white",
  "black",
  "gray",
  "silver",
  "blue",
  "red",
  "green",
  "beige",
  "brown",
  "orange",
  "yellow",
] as const;
const REGISTRATION_COUNTRIES = ["MD", "RO", "DE", "IT", "FR", "NL", "BE", "BG", "UA", "other"] as const;
const YES_NO_UNKNOWN = ["yes", "no", "unknown"] as const;
const HEATING_OPTIONS = ["gas-central", "electric-central", "district-heating", "stove", "heat-pump", "other"] as const;
const PARKING_OPTIONS = ["garage", "underground-parking", "outdoor-parking", "none"] as const;
const ENERGY_CLASS_OPTIONS = ["A+", "A", "B", "C", "D", "E", "F", "G"] as const;
const PRODUCT_TYPES = ["phone", "laptop", "pc", "tablet", "monitor", "tv", "components", "accessories"] as const;
const STORAGE_OPTIONS = ["32", "64", "128", "256", "512", "1024", "2048"] as const;
const RAM_OPTIONS = ["2", "4", "6", "8", "12", "16", "24", "32", "64"] as const;
const SCREEN_OPTIONS = ["5", "6", "6.5", "7", "10", "13", "14", "15.6", "17", "24", "27", "32"] as const;
const PROCESSOR_OPTIONS = ["intel-i3", "intel-i5", "intel-i7", "intel-i9", "amd-ryzen3", "amd-ryzen5", "amd-ryzen7", "apple-m1", "apple-m2", "apple-m3"] as const;
const VIDEO_CARD_OPTIONS = ["integrata", "nvidia-gtx", "nvidia-rtx", "amd-radeon", "apple-gpu"] as const;
const MATERIAL_OPTIONS = ["cotton", "wool", "polyester", "leather", "denim", "linen", "blend"] as const;
const GENDER_OPTIONS = ["men", "women", "unisex", "kids"] as const;
const SEASON_OPTIONS = ["spring", "summer", "autumn", "winter", "all-season"] as const;
const WORK_SCHEDULE_OPTIONS = ["full-time", "part-time", "flexible", "shift", "weekend"] as const;
const EDUCATION_LEVELS = ["none", "high-school", "college", "bachelor", "master", "doctorate"] as const;
const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "nativ"] as const;
const REMOTE_POLICY = ["on-site", "hybrid", "remote"] as const;
const EMISSION_CLASSES = ["euro-3", "euro-4", "euro-5", "euro-6", "euro-6d", "zero"] as const;
const RENOVATION_TYPES = ["shell-and-core", "partial", "complete", "premium", "not-renovated"] as const;
const DATE_OPTIONS = ["immediately", "1-week", "2-weeks", "1-month", "negotiable"] as const;
const OS_OPTIONS = ["ios", "android", "windows", "macos", "linux", "altul"] as const;
const CONNECTIVITY_OPTIONS = ["wifi", "4g", "5g", "bluetooth", "nfc", "gps"] as const;
const FIT_OPTIONS = ["slim", "regular", "oversize", "relaxed", "skinny"] as const;
const COMPANY_TYPES = ["llc", "joint-stock", "sole-trader", "individual-entrepreneur", "ngo", "other"] as const;
const INDUSTRY_OPTIONS = [
  "it",
  "sales",
  "marketing",
  "logistics",
  "construction",
  "automotive",
  "finance",
  "hospitality",
  "medical",
  "education",
  "other",
] as const;

export const categoryConfig: Record<ListingCategoryKey, CategoryConfig> = {
  auto: {
    fields: [
      { id: "brand", label: "Brand", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "year", label: "Year", input: "number", min: 1950, max: 2030 },
      { id: "mileageKm", label: "Mileage (km)", input: "number", min: 0, max: 9_999_999 },
      { id: "fuel", label: "Fuel type", input: "select", options: FUEL_OPTIONS },
      { id: "transmission", label: "Transmission", input: "select", options: TRANSMISSION_OPTIONS },
      { id: "bodyType", label: "Body type", input: "select", options: BODY_TYPES },
      { id: "doors", label: "Doors", input: "select", options: DOORS_OPTIONS },
      { id: "seats", label: "Seats", input: "select", options: SEATS_OPTIONS },
      { id: "color", label: "Color", input: "select", options: COLOR_OPTIONS },
      { id: "powerHp", label: "Power (HP)", input: "number", min: 30, max: 2000 },
      { id: "engineCc", label: "Engine capacity (cc)", input: "number", min: 600, max: 8000 },
      { id: "registrationCountry", label: "Registration country", input: "select", options: REGISTRATION_COUNTRIES },
      { id: "serviceHistory", label: "Service history", input: "select", options: YES_NO_UNKNOWN },
      { id: "accidentFree", label: "Accident free", input: "select", options: YES_NO_UNKNOWN },
      { id: "numberOfOwners", label: "Number of owners", input: "number", min: 1, max: 20 },
      { id: "emissionClass", label: "Emission class", input: "select", options: EMISSION_CLASSES },
    ],
    subcategories: {
      auto: ["autovehicule", "camioane", "electrice"],
    },
  },
  moto: {
    fields: [
      { id: "brand", label: "Brand", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "year", label: "Year", input: "number", min: 1950, max: 2030 },
      { id: "engineCc", label: "Engine capacity (cc)", input: "number", min: 50, max: 3000 },
      { id: "mileageKm", label: "Mileage (km)", input: "number", min: 0, max: 9_999_999 },
      { id: "engineType", label: "Engine type", input: "select", options: ENGINE_TYPES },
      { id: "fuel", label: "Fuel type", input: "select", options: FUEL_OPTIONS },
      { id: "transmission", label: "Transmission", input: "select", options: TRANSMISSION_OPTIONS },
      { id: "powerHp", label: "Power (HP)", input: "number", min: 5, max: 500 },
      { id: "color", label: "Color", input: "select", options: COLOR_OPTIONS },
      { id: "serviceHistory", label: "Service history", input: "select", options: YES_NO_UNKNOWN },
      { id: "accidentFree", label: "Accident free", input: "select", options: YES_NO_UNKNOWN },
      { id: "numberOfOwners", label: "Number of owners", input: "number", min: 1, max: 20 },
      { id: "emissionClass", label: "Emission class", input: "select", options: EMISSION_CLASSES },
      { id: "batteryCapacityKwh", label: "Battery capacity (kWh)", input: "number", min: 1, max: 40 },
      { id: "rangeKm", label: "Range (km)", input: "number", min: 20, max: 500 },
      { id: "cargoVolumeM3", label: "Cargo volume (m3)", input: "number", min: 0, max: 5 },
    ],
    brands: {
      BMW: ["S1000RR", "R1250GS"],
      Yamaha: ["R1", "MT-07"],
      Honda: ["CBR600RR"],
    },
  },
  imobiliare: {
    fields: [
      { id: "propertyType", label: "Property type", input: "select", options: PROPERTY_TYPES },
      { id: "areaSqm", label: "Area (sqm)", input: "number", min: 1, max: 999_999_999 },
      { id: "rooms", label: "Rooms", input: "number", min: 1, max: 100 },
      { id: "floor", label: "Floor", input: "select", options: FLOOR_OPTIONS },
      { id: "furnished", label: "Furnished", input: "select", options: YES_NO_PARTIAL },
      { id: "buildYear", label: "Build year", input: "number", min: 1800, max: 2030 },
      { id: "landAreaSqm", label: "Land area (sqm)", input: "number", min: 1, max: 999_999_999 },
      { id: "totalFloors", label: "Total floors", input: "number", min: 1, max: 200 },
      { id: "balconies", label: "Balconies", input: "number", min: 0, max: 20 },
      { id: "bathrooms", label: "Bathrooms", input: "number", min: 1, max: 30 },
      { id: "heatingType", label: "Heating type", input: "select", options: HEATING_OPTIONS },
      { id: "parkingType", label: "Parking", input: "select", options: PARKING_OPTIONS },
      { id: "energyClass", label: "Energy class", input: "select", options: ENERGY_CLASS_OPTIONS },
      { id: "livingAreaSqm", label: "Living area (sqm)", input: "number", min: 1, max: 999_999_999 },
      { id: "kitchenAreaSqm", label: "Kitchen area (sqm)", input: "number", min: 1, max: 999_999_999 },
      { id: "renovationType", label: "Renovation level", input: "select", options: RENOVATION_TYPES },
      { id: "availableFrom", label: "Available from", input: "select", options: DATE_OPTIONS },
      { id: "petsAllowed", label: "Pets allowed", input: "select", options: YES_NO_UNKNOWN },
      { id: "elevator", label: "Lift", input: "select", options: YES_NO_UNKNOWN },
      { id: "internet", label: "Internet inclus", input: "select", options: YES_NO_UNKNOWN },
    ],
  },
  electronice: {
    fields: [
      { id: "brand", label: "Brand", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "condition", label: "Condition", input: "select", options: PRODUCT_CONDITION },
      { id: "warranty", label: "Warranty", input: "select", options: WARRANTY_OPTIONS },
      { id: "productType", label: "Product type", input: "select", options: PRODUCT_TYPES },
      { id: "storageGb", label: "Storage (GB)", input: "select", options: STORAGE_OPTIONS },
      { id: "ramGb", label: "RAM (GB)", input: "select", options: RAM_OPTIONS },
      { id: "screenInch", label: "Screen size", input: "select", options: SCREEN_OPTIONS },
      { id: "batteryHealth", label: "Battery health (%)", input: "number", min: 1, max: 100 },
      { id: "processorType", label: "Processor", input: "select", options: PROCESSOR_OPTIONS },
      { id: "videoCard", label: "Graphics card", input: "select", options: VIDEO_CARD_OPTIONS },
      { id: "color", label: "Color", input: "select", options: COLOR_OPTIONS },
      { id: "smartFeatures", label: "Smart features", input: "select", options: YES_NO_UNKNOWN },
      { id: "refreshRateHz", label: "Refresh rate (Hz)", input: "number", min: 30, max: 360 },
      { id: "cameraMp", label: "Camera (MP)", input: "number", min: 1, max: 300 },
      { id: "simType", label: "Dual SIM", input: "select", options: YES_NO_UNKNOWN },
      { id: "osType", label: "Sistem operare", input: "select", options: OS_OPTIONS },
      { id: "connectivity", label: "Connectivity", input: "select", options: CONNECTIVITY_OPTIONS },
      { id: "originalBox", label: "Original box", input: "select", options: YES_NO_UNKNOWN },
      { id: "waterResistance", label: "Water resistance", input: "select", options: YES_NO_UNKNOWN },
    ],
    brands: {
      Apple: ["iPhone 14", "iPhone 15", "MacBook Air"],
      Samsung: ["Galaxy S23", "Galaxy S24", "Galaxy Book"],
      Lenovo: ["ThinkPad X1", "Legion 5", "IdeaPad 5"],
    },
  },
  haine: {
    fields: [
      { id: "sizeLabel", label: "Size", input: "select", options: CLOTHES_SIZE },
      { id: "brand", label: "Brand", input: "select" },
      { id: "condition", label: "Condition", input: "select", options: PRODUCT_CONDITION },
      { id: "material", label: "Material", input: "select", options: MATERIAL_OPTIONS },
      { id: "forGender", label: "For", input: "select", options: GENDER_OPTIONS },
      { id: "season", label: "Season", input: "select", options: SEASON_OPTIONS },
      { id: "colorway", label: "Primary color", input: "select", options: COLOR_OPTIONS },
      { id: "warranty", label: "Warranty", input: "select", options: WARRANTY_OPTIONS },
      { id: "fitType", label: "Fit", input: "select", options: FIT_OPTIONS },
      { id: "waistCm", label: "Waist (cm)", input: "number", min: 30, max: 220 },
      { id: "lengthCm", label: "Length (cm)", input: "number", min: 30, max: 250 },
      { id: "shoeSizeEu", label: "EU shoe size", input: "number", min: 15, max: 55 },
    ],
    brands: {
      Nike: ["Air Max", "Tech Fleece"],
      Adidas: ["Originals", "Terrex"],
      Zara: ["Basic", "Premium"],
    },
  },
  joburi: {
    fields: [
      { id: "salary", label: "Salary", input: "number", min: 0, max: 999_999_999 },
      { id: "jobType", label: "Job type", input: "select", options: JOB_TYPES },
      { id: "experienceYears", label: "Experience", input: "number", min: 0, max: 60 },
      { id: "workSchedule", label: "Work schedule", input: "select", options: WORK_SCHEDULE_OPTIONS },
      { id: "educationLevel", label: "Education level", input: "select", options: EDUCATION_LEVELS },
      { id: "languageLevel", label: "Language level", input: "select", options: LANGUAGE_LEVELS },
      { id: "contractDurationMonths", label: "Contract duration (months)", input: "number", min: 1, max: 120 },
      { id: "remotePolicy", label: "Remote policy", input: "select", options: REMOTE_POLICY },
      { id: "companyType", label: "Company type", input: "select", options: COMPANY_TYPES },
      { id: "industry", label: "Industry", input: "select", options: INDUSTRY_OPTIONS },
      { id: "positionsOpen", label: "Open positions", input: "number", min: 1, max: 999 },
      { id: "benefits", label: "Benefits", input: "select", options: YES_NO_UNKNOWN },
      { id: "driverLicenseRequired", label: "Driver license required", input: "select", options: YES_NO_UNKNOWN },
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
  if (key === "auto") {
    return [...VEHICLE_BRANDS];
  }
  return Object.keys(categoryConfig[key].brands ?? {});
}

export function getModelsForCategoryBrand(key: ListingCategoryKey | null, brand: string): string[] {
  if (!key || !brand.trim()) {
    return [];
  }
  if (key === "auto") {
    return [...getModelsForBrand(brand)];
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
  if (key === "auto") {
    return VEHICLE_BRANDS.includes(normalizedBrand as (typeof VEHICLE_BRANDS)[number]);
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
  if (key === "auto") {
    return getModelsForBrand(brand).includes(normalizedModel);
  }
  const allowedModels = getModelsForCategoryBrand(key, brand);
  return allowedModels.includes(normalizedModel);
}
