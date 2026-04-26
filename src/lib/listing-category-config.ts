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
const FUEL_OPTIONS = ["benzina", "diesel", "hibrid", "electric", "gpl", "altul"] as const;
const TRANSMISSION_OPTIONS = ["manuala", "automata", "semi-automata"] as const;
const ENGINE_TYPES = ["2t", "4t", "electric"] as const;
const PROPERTY_TYPES = ["apartament", "casa", "spatiu-comercial", "teren", "alta"] as const;
const FLOOR_OPTIONS = ["parter", "1", "2", "3", "4", "5+", "ultimul", "mansarda"] as const;
const PRODUCT_CONDITION = ["nou", "folosit", "refurbished"] as const;
const WARRANTY_OPTIONS = ["fara", "3-luni", "6-luni", "12-luni", "24-luni+"] as const;
const CLOTHES_SIZE = ["XS", "S", "M", "L", "XL", "XXL", "alta"] as const;
const JOB_TYPES = ["full-time", "part-time", "remote", "contract", "internship"] as const;
const BODY_TYPES = ["sedan", "hatchback", "suv", "coupe", "wagon", "pickup", "van", "cabrio"] as const;
const DRIVETRAIN_OPTIONS = ["fata", "spate", "integrala", "4x4"] as const;
const DOORS_OPTIONS = ["2", "3", "4", "5"] as const;
const SEATS_OPTIONS = ["2", "4", "5", "7", "8", "9"] as const;
const COLOR_OPTIONS = [
  "alb",
  "negru",
  "gri",
  "argintiu",
  "albastru",
  "rosu",
  "verde",
  "bej",
  "maro",
  "portocaliu",
  "galben",
] as const;
const REGISTRATION_COUNTRIES = ["MD", "RO", "DE", "IT", "FR", "NL", "BE", "BG", "UA", "other"] as const;
const YES_NO_UNKNOWN = ["yes", "no", "unknown"] as const;
const HEATING_OPTIONS = ["centrala-gaz", "centrala-electrica", "termoficare", "soba", "pompa-caldura", "alta"] as const;
const PARKING_OPTIONS = ["garaj", "parcare-subterana", "parcare-exterioara", "fara"] as const;
const ENERGY_CLASS_OPTIONS = ["A+", "A", "B", "C", "D", "E", "F", "G"] as const;
const PRODUCT_TYPES = ["telefon", "laptop", "pc", "tableta", "monitor", "tv", "componente", "accesorii"] as const;
const STORAGE_OPTIONS = ["32", "64", "128", "256", "512", "1024", "2048"] as const;
const RAM_OPTIONS = ["2", "4", "6", "8", "12", "16", "24", "32", "64"] as const;
const SCREEN_OPTIONS = ["5", "6", "6.5", "7", "10", "13", "14", "15.6", "17", "24", "27", "32"] as const;
const PROCESSOR_OPTIONS = ["intel-i3", "intel-i5", "intel-i7", "intel-i9", "amd-ryzen3", "amd-ryzen5", "amd-ryzen7", "apple-m1", "apple-m2", "apple-m3"] as const;
const VIDEO_CARD_OPTIONS = ["integrata", "nvidia-gtx", "nvidia-rtx", "amd-radeon", "apple-gpu"] as const;
const MATERIAL_OPTIONS = ["bumbac", "lana", "poliester", "piele", "denim", "in", "amestec"] as const;
const GENDER_OPTIONS = ["barbati", "femei", "unisex", "copii"] as const;
const SEASON_OPTIONS = ["primavara", "vara", "toamna", "iarna", "all-season"] as const;
const WORK_SCHEDULE_OPTIONS = ["full-time", "part-time", "flexibil", "in-ture", "weekend"] as const;
const EDUCATION_LEVELS = ["fara", "liceu", "colegiu", "facultate", "master", "doctorat"] as const;
const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "nativ"] as const;
const REMOTE_POLICY = ["on-site", "hybrid", "remote"] as const;
const EMISSION_CLASSES = ["euro-3", "euro-4", "euro-5", "euro-6", "euro-6d", "zero"] as const;
const WHEEL_DRIVE_TYPES = ["fwd", "rwd", "awd", "4x4"] as const;
const RENOVATION_TYPES = ["la-rosu", "partial", "complet", "lux", "fara-renovare"] as const;
const DATE_OPTIONS = ["imediat", "1-saptamana", "2-saptamani", "1-luna", "negociabil"] as const;
const OS_OPTIONS = ["ios", "android", "windows", "macos", "linux", "altul"] as const;
const CONNECTIVITY_OPTIONS = ["wifi", "4g", "5g", "bluetooth", "nfc", "gps"] as const;
const FIT_OPTIONS = ["slim", "regular", "oversize", "relaxed", "skinny"] as const;
const COMPANY_TYPES = ["srl", "sa", "ii", "ip", "ong", "alta"] as const;
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
      { id: "brand", label: "Marca", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "year", label: "An", input: "number", min: 1950, max: 2030 },
      { id: "mileageKm", label: "Kilometraj", input: "number", min: 0, max: 9_999_999 },
      { id: "fuel", label: "Combustibil", input: "select", options: FUEL_OPTIONS },
      { id: "transmission", label: "Transmisie", input: "select", options: TRANSMISSION_OPTIONS },
      { id: "bodyType", label: "Caroserie", input: "select", options: BODY_TYPES },
      { id: "drivetrain", label: "Tracțiune", input: "select", options: DRIVETRAIN_OPTIONS },
      { id: "doors", label: "Număr uși", input: "select", options: DOORS_OPTIONS },
      { id: "seats", label: "Locuri", input: "select", options: SEATS_OPTIONS },
      { id: "color", label: "Culoare", input: "select", options: COLOR_OPTIONS },
      { id: "powerHp", label: "Putere (CP)", input: "number", min: 30, max: 2000 },
      { id: "engineCc", label: "Capacitate cilindrică (cm3)", input: "number", min: 600, max: 8000 },
      { id: "registrationCountry", label: "Țară înmatriculare", input: "select", options: REGISTRATION_COUNTRIES },
      { id: "serviceHistory", label: "Istoric service", input: "select", options: YES_NO_UNKNOWN },
      { id: "accidentFree", label: "Fără accidente", input: "select", options: YES_NO_UNKNOWN },
      { id: "numberOfOwners", label: "Număr proprietari", input: "number", min: 1, max: 20 },
      { id: "vin", label: "Serie șasiu (VIN)", input: "number", min: 10000000000000000, max: 99999999999999999 },
      { id: "emissionClass", label: "Normă poluare", input: "select", options: EMISSION_CLASSES },
      { id: "wheelDriveType", label: "Tip tracțiune", input: "select", options: WHEEL_DRIVE_TYPES },
      { id: "batteryCapacityKwh", label: "Capacitate baterie (kWh)", input: "number", min: 5, max: 250 },
      { id: "rangeKm", label: "Autonomie (km)", input: "number", min: 50, max: 1200 },
      { id: "fastCharge", label: "Încărcare rapidă", input: "select", options: YES_NO_UNKNOWN },
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
      { id: "fuel", label: "Combustibil", input: "select", options: FUEL_OPTIONS },
      { id: "transmission", label: "Transmisie", input: "select", options: TRANSMISSION_OPTIONS },
      { id: "powerHp", label: "Putere (CP)", input: "number", min: 5, max: 500 },
      { id: "color", label: "Culoare", input: "select", options: COLOR_OPTIONS },
      { id: "serviceHistory", label: "Istoric service", input: "select", options: YES_NO_UNKNOWN },
      { id: "accidentFree", label: "Fără accidente", input: "select", options: YES_NO_UNKNOWN },
      { id: "numberOfOwners", label: "Număr proprietari", input: "number", min: 1, max: 20 },
      { id: "emissionClass", label: "Normă poluare", input: "select", options: EMISSION_CLASSES },
      { id: "batteryCapacityKwh", label: "Capacitate baterie (kWh)", input: "number", min: 1, max: 40 },
      { id: "rangeKm", label: "Autonomie (km)", input: "number", min: 20, max: 500 },
      { id: "cargoVolumeM3", label: "Volum portbagaj (m3)", input: "number", min: 0, max: 5 },
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
      { id: "buildYear", label: "An construcție", input: "number", min: 1800, max: 2030 },
      { id: "landAreaSqm", label: "Suprafață teren", input: "number", min: 1, max: 999_999_999 },
      { id: "totalFloors", label: "Număr total etaje", input: "number", min: 1, max: 200 },
      { id: "balconies", label: "Balcoane", input: "number", min: 0, max: 20 },
      { id: "bathrooms", label: "Băi", input: "number", min: 1, max: 30 },
      { id: "heatingType", label: "Tip încălzire", input: "select", options: HEATING_OPTIONS },
      { id: "parkingType", label: "Parcare", input: "select", options: PARKING_OPTIONS },
      { id: "energyClass", label: "Clasă energetică", input: "select", options: ENERGY_CLASS_OPTIONS },
      { id: "livingAreaSqm", label: "Suprafață locuibilă", input: "number", min: 1, max: 999_999_999 },
      { id: "kitchenAreaSqm", label: "Suprafață bucătărie", input: "number", min: 1, max: 999_999_999 },
      { id: "renovationType", label: "Tip renovare", input: "select", options: RENOVATION_TYPES },
      { id: "availableFrom", label: "Disponibil din", input: "select", options: DATE_OPTIONS },
      { id: "petsAllowed", label: "Animale permise", input: "select", options: YES_NO_UNKNOWN },
      { id: "elevator", label: "Lift", input: "select", options: YES_NO_UNKNOWN },
      { id: "internet", label: "Internet inclus", input: "select", options: YES_NO_UNKNOWN },
    ],
  },
  electronice: {
    fields: [
      { id: "brand", label: "Brand", input: "select" },
      { id: "modelName", label: "Model", input: "select" },
      { id: "condition", label: "Stare", input: "select", options: PRODUCT_CONDITION },
      { id: "warranty", label: "Garanție", input: "select", options: WARRANTY_OPTIONS },
      { id: "productType", label: "Tip produs", input: "select", options: PRODUCT_TYPES },
      { id: "storageGb", label: "Stocare (GB)", input: "select", options: STORAGE_OPTIONS },
      { id: "ramGb", label: "RAM (GB)", input: "select", options: RAM_OPTIONS },
      { id: "screenInch", label: "Diagonală ecran", input: "select", options: SCREEN_OPTIONS },
      { id: "batteryHealth", label: "Sănătate baterie (%)", input: "number", min: 1, max: 100 },
      { id: "processorType", label: "Procesor", input: "select", options: PROCESSOR_OPTIONS },
      { id: "videoCard", label: "Placă video", input: "select", options: VIDEO_CARD_OPTIONS },
      { id: "color", label: "Culoare", input: "select", options: COLOR_OPTIONS },
      { id: "smartFeatures", label: "Funcții smart", input: "select", options: YES_NO_UNKNOWN },
      { id: "refreshRateHz", label: "Rată refresh (Hz)", input: "number", min: 30, max: 360 },
      { id: "cameraMp", label: "Cameră (MP)", input: "number", min: 1, max: 300 },
      { id: "simType", label: "Dual SIM", input: "select", options: YES_NO_UNKNOWN },
      { id: "osType", label: "Sistem operare", input: "select", options: OS_OPTIONS },
      { id: "connectivity", label: "Conectivitate", input: "select", options: CONNECTIVITY_OPTIONS },
      { id: "originalBox", label: "Cutie originală", input: "select", options: YES_NO_UNKNOWN },
      { id: "waterResistance", label: "Rezistență apă", input: "select", options: YES_NO_UNKNOWN },
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
      { id: "material", label: "Material", input: "select", options: MATERIAL_OPTIONS },
      { id: "forGender", label: "Pentru", input: "select", options: GENDER_OPTIONS },
      { id: "season", label: "Sezon", input: "select", options: SEASON_OPTIONS },
      { id: "colorway", label: "Culoare principală", input: "select", options: COLOR_OPTIONS },
      { id: "warranty", label: "Garanție", input: "select", options: WARRANTY_OPTIONS },
      { id: "fitType", label: "Croială", input: "select", options: FIT_OPTIONS },
      { id: "waistCm", label: "Talie (cm)", input: "number", min: 30, max: 220 },
      { id: "lengthCm", label: "Lungime (cm)", input: "number", min: 30, max: 250 },
      { id: "shoeSizeEu", label: "Mărime încălțăminte EU", input: "number", min: 15, max: 55 },
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
      { id: "workSchedule", label: "Program", input: "select", options: WORK_SCHEDULE_OPTIONS },
      { id: "educationLevel", label: "Studii minime", input: "select", options: EDUCATION_LEVELS },
      { id: "languageLevel", label: "Nivel limbă", input: "select", options: LANGUAGE_LEVELS },
      { id: "contractDurationMonths", label: "Durată contract (luni)", input: "number", min: 1, max: 120 },
      { id: "remotePolicy", label: "Politică lucru", input: "select", options: REMOTE_POLICY },
      { id: "companyType", label: "Tip companie", input: "select", options: COMPANY_TYPES },
      { id: "industry", label: "Industrie", input: "select", options: INDUSTRY_OPTIONS },
      { id: "positionsOpen", label: "Posturi disponibile", input: "number", min: 1, max: 999 },
      { id: "benefits", label: "Beneficii oferite", input: "select", options: YES_NO_UNKNOWN },
      { id: "driverLicenseRequired", label: "Permis necesar", input: "select", options: YES_NO_UNKNOWN },
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
