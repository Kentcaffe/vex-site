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
import listingDynamicFields from "@/config/listing-dynamic-fields.json";

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
  /**
   * Optional slug matcher(s) for subcategory-specific fields.
   * Example: ["imobiliare-teren", /electrice/]
   */
  appliesTo?: ReadonlyArray<string | RegExp>;
};

export type ListingUiLocale = "ro" | "ru" | "en";

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
const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "native"] as const;
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

type JsonPublishRow = {
  name: string;
  type: "select" | "number";
  optionsRef?: string;
  min?: number;
  max?: number;
  appliesTo?: string[];
};

function humanizeFieldId(fieldId: string): string {
  return fieldId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

const PUBLISH_OPTION_REGISTRY: Record<string, readonly string[]> = {
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  BODY_TYPES,
  DOORS_OPTIONS,
  SEATS_OPTIONS,
  COLOR_OPTIONS,
  REGISTRATION_COUNTRIES,
  YES_NO_UNKNOWN,
  EMISSION_CLASSES,
  ENGINE_TYPES,
  PROPERTY_TYPES,
  FLOOR_OPTIONS,
  YES_NO_PARTIAL,
  HEATING_OPTIONS,
  PARKING_OPTIONS,
  ENERGY_CLASS_OPTIONS,
  RENOVATION_TYPES,
  DATE_OPTIONS,
  PRODUCT_CONDITION,
  WARRANTY_OPTIONS,
  PRODUCT_TYPES,
  STORAGE_OPTIONS,
  RAM_OPTIONS,
  SCREEN_OPTIONS,
  PROCESSOR_OPTIONS,
  VIDEO_CARD_OPTIONS,
  CLOTHES_SIZE,
  MATERIAL_OPTIONS,
  GENDER_OPTIONS,
  SEASON_OPTIONS,
  FIT_OPTIONS,
  JOB_TYPES,
  WORK_SCHEDULE_OPTIONS,
  EDUCATION_LEVELS,
  LANGUAGE_LEVELS,
  REMOTE_POLICY,
  COMPANY_TYPES,
  INDUSTRY_OPTIONS,
  OS_OPTIONS,
  CONNECTIVITY_OPTIONS,
};

function materializePublishFields(key: ListingCategoryKey): ListingFieldConfig[] {
  const rows = (listingDynamicFields as { publish: Record<string, JsonPublishRow[]> }).publish[key];
  if (!rows?.length) {
    return [];
  }
  return rows.map((row) => {
    const opts = row.optionsRef ? PUBLISH_OPTION_REGISTRY[row.optionsRef] : undefined;
    const appliesTo = row.appliesTo?.map((s) => new RegExp(s));
    const base: ListingFieldConfig = {
      id: row.name as ListingFieldId,
      label: humanizeFieldId(row.name),
      input: row.type,
    };
    if (opts) {
      return { ...base, options: [...opts], ...(typeof row.min === "number" ? { min: row.min } : {}), ...(typeof row.max === "number" ? { max: row.max } : {}), ...(appliesTo?.length ? { appliesTo } : {}) };
    }
    return {
      ...base,
      ...(typeof row.min === "number" ? { min: row.min } : {}),
      ...(typeof row.max === "number" ? { max: row.max } : {}),
      ...(appliesTo?.length ? { appliesTo } : {}),
    };
  });
}

export const categoryConfig: Record<ListingCategoryKey, CategoryConfig> = {
  auto: {
    fields: materializePublishFields("auto"),
    subcategories: {
      auto: ["autovehicule", "camioane", "electrice"],
    },
  },
  moto: {
    fields: materializePublishFields("moto"),
    brands: {
      BMW: ["S1000RR", "R1250GS"],
      Yamaha: ["R1", "MT-07"],
      Honda: ["CBR600RR"],
    },
  },
  imobiliare: {
    fields: materializePublishFields("imobiliare"),
  },
  electronice: {
    fields: materializePublishFields("electronice"),
    brands: {
      Apple: ["iPhone 14", "iPhone 15", "MacBook Air"],
      Samsung: ["Galaxy S23", "Galaxy S24", "Galaxy Book"],
      Lenovo: ["ThinkPad X1", "Legion 5", "IdeaPad 5"],
    },
  },
  haine: {
    fields: materializePublishFields("haine"),
    brands: {
      Nike: ["Air Max", "Tech Fleece"],
      Adidas: ["Originals", "Terrex"],
      Zara: ["Basic", "Premium"],
    },
  },
  joburi: {
    fields: materializePublishFields("joburi"),
  },
};

const FIELD_LABELS: Partial<Record<ListingFieldId, Record<ListingUiLocale, string>>> = {
  brand: { ro: "Marcă", ru: "Марка", en: "Brand" },
  modelName: { ro: "Model", ru: "Модель", en: "Model" },
  year: { ro: "An", ru: "Год", en: "Year" },
  mileageKm: { ro: "Kilometraj (km)", ru: "Пробег (км)", en: "Mileage (km)" },
  fuel: { ro: "Combustibil", ru: "Топливо", en: "Fuel type" },
  transmission: { ro: "Transmisie", ru: "Коробка передач", en: "Transmission" },
  bodyType: { ro: "Caroserie", ru: "Тип кузова", en: "Body type" },
  doors: { ro: "Număr uși", ru: "Количество дверей", en: "Doors" },
  seats: { ro: "Locuri", ru: "Количество мест", en: "Seats" },
  color: { ro: "Culoare", ru: "Цвет", en: "Color" },
  powerHp: { ro: "Putere (CP)", ru: "Мощность (л.с.)", en: "Power (HP)" },
  engineCc: { ro: "Cilindree (cm3)", ru: "Объем двигателя (см3)", en: "Engine capacity (cc)" },
  registrationCountry: { ro: "Țară înmatriculare", ru: "Страна регистрации", en: "Registration country" },
  serviceHistory: { ro: "Istoric service", ru: "Сервисная история", en: "Service history" },
  accidentFree: { ro: "Fără accidente", ru: "Без ДТП", en: "Accident free" },
  numberOfOwners: { ro: "Număr proprietari", ru: "Количество владельцев", en: "Number of owners" },
  emissionClass: { ro: "Normă poluare", ru: "Экокласс", en: "Emission class" },
  batteryCapacityKwh: { ro: "Capacitate baterie (kWh)", ru: "Емкость батареи (кВтч)", en: "Battery capacity (kWh)" },
  rangeKm: { ro: "Autonomie (km)", ru: "Запас хода (км)", en: "Range (km)" },
  fastCharge: { ro: "Încărcare rapidă", ru: "Быстрая зарядка", en: "Fast charging" },
  payloadKg: { ro: "Sarcină utilă (kg)", ru: "Грузоподъемность (кг)", en: "Payload (kg)" },
  axlesCount: { ro: "Număr axe", ru: "Количество осей", en: "Axles" },
  cargoVolumeM3: { ro: "Volum marfă (m3)", ru: "Объем груза (м3)", en: "Cargo volume (m3)" },
  propertyType: { ro: "Tip proprietate", ru: "Тип недвижимости", en: "Property type" },
  areaSqm: { ro: "Suprafață (m²)", ru: "Площадь (м²)", en: "Area (sqm)" },
  rooms: { ro: "Camere", ru: "Комнаты", en: "Rooms" },
  floor: { ro: "Etaj", ru: "Этаж", en: "Floor" },
  furnished: { ro: "Mobilat", ru: "Меблировка", en: "Furnished" },
  buildYear: { ro: "An construcție", ru: "Год постройки", en: "Build year" },
  landAreaSqm: { ro: "Suprafață teren (m²)", ru: "Площадь участка (м²)", en: "Land area (sqm)" },
  totalFloors: { ro: "Total etaje", ru: "Всего этажей", en: "Total floors" },
  balconies: { ro: "Balcoane", ru: "Балконы", en: "Balconies" },
  bathrooms: { ro: "Băi", ru: "Санузлы", en: "Bathrooms" },
  heatingType: { ro: "Tip încălzire", ru: "Тип отопления", en: "Heating type" },
  parkingType: { ro: "Parcare", ru: "Парковка", en: "Parking" },
  energyClass: { ro: "Clasă energetică", ru: "Класс энергоэффективности", en: "Energy class" },
  availableFrom: { ro: "Disponibil din", ru: "Доступно с", en: "Available from" },
  petsAllowed: { ro: "Animale permise", ru: "Можно с животными", en: "Pets allowed" },
  elevator: { ro: "Lift", ru: "Лифт", en: "Elevator" },
  internet: { ro: "Internet inclus", ru: "Интернет включен", en: "Internet included" },
  condition: { ro: "Stare", ru: "Состояние", en: "Condition" },
  warranty: { ro: "Garanție", ru: "Гарантия", en: "Warranty" },
  productType: { ro: "Tip produs", ru: "Тип товара", en: "Product type" },
  storageGb: { ro: "Stocare (GB)", ru: "Память (GB)", en: "Storage (GB)" },
  ramGb: { ro: "RAM (GB)", ru: "ОЗУ (GB)", en: "RAM (GB)" },
  screenInch: { ro: "Diagonală ecran", ru: "Диагональ экрана", en: "Screen size" },
  processorType: { ro: "Procesor", ru: "Процессор", en: "Processor" },
  videoCard: { ro: "Placă video", ru: "Видеокарта", en: "Graphics card" },
  salary: { ro: "Salariu", ru: "Зарплата", en: "Salary" },
  jobType: { ro: "Tip job", ru: "Тип занятости", en: "Job type" },
};

const OPTION_LABELS: Record<string, Record<ListingUiLocale, string>> = {
  yes: { ro: "Da", ru: "Да", en: "Yes" },
  no: { ro: "Nu", ru: "Нет", en: "No" },
  unknown: { ro: "Necunoscut", ru: "Неизвестно", en: "Unknown" },
  petrol: { ro: "Benzină", ru: "Бензин", en: "Petrol" },
  diesel: { ro: "Motorină", ru: "Дизель", en: "Diesel" },
  hybrid: { ro: "Hibrid", ru: "Гибрид", en: "Hybrid" },
  electric: { ro: "Electric", ru: "Электро", en: "Electric" },
  lpg: { ro: "GPL", ru: "Газ", en: "LPG" },
  manual: { ro: "Manuală", ru: "Механика", en: "Manual" },
  automatic: { ro: "Automată", ru: "Автомат", en: "Automatic" },
  "semi-automatic": { ro: "Semi-automată", ru: "Полуавтомат", en: "Semi-automatic" },
  "front-wheel": { ro: "Față", ru: "Передний", en: "Front-wheel" },
  "rear-wheel": { ro: "Spate", ru: "Задний", en: "Rear-wheel" },
  "all-wheel": { ro: "Integrală", ru: "Полный", en: "All-wheel" },
  sedan: { ro: "Sedan", ru: "Седан", en: "Sedan" },
  hatchback: { ro: "Hatchback", ru: "Хэтчбек", en: "Hatchback" },
  suv: { ro: "SUV", ru: "SUV", en: "SUV" },
  coupe: { ro: "Coupe", ru: "Купе", en: "Coupe" },
  wagon: { ro: "Break", ru: "Универсал", en: "Wagon" },
  pickup: { ro: "Pick-up", ru: "Пикап", en: "Pickup" },
  van: { ro: "Van", ru: "Фургон", en: "Van" },
  convertible: { ro: "Cabrio", ru: "Кабриолет", en: "Convertible" },
  apartment: { ro: "Apartament", ru: "Квартира", en: "Apartment" },
  house: { ro: "Casă", ru: "Дом", en: "House" },
  "commercial-space": { ro: "Spațiu comercial", ru: "Коммерческое помещение", en: "Commercial space" },
  land: { ro: "Teren", ru: "Земля", en: "Land" },
  new: { ro: "Nou", ru: "Новый", en: "New" },
  used: { ro: "Folosit", ru: "Б/у", en: "Used" },
  refurbished: { ro: "Recondiționat", ru: "Восстановленный", en: "Refurbished" },
  none: { ro: "Fără", ru: "Нет", en: "None" },
};

export function resolveListingUiLocale(locale: string): ListingUiLocale {
  const l = locale.toLowerCase();
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("ro")) return "ro";
  return "en";
}

export function getLocalizedFieldLabel(fieldId: ListingFieldId, locale: string): string {
  const lang = resolveListingUiLocale(locale);
  return FIELD_LABELS[fieldId]?.[lang] ?? FIELD_LABELS[fieldId]?.en ?? humanizeFieldId(fieldId);
}

export function getLocalizedFieldOptionLabel(fieldId: ListingFieldId, value: string, locale: string): string {
  void fieldId;
  const lang = resolveListingUiLocale(locale);
  return OPTION_LABELS[value]?.[lang] ?? OPTION_LABELS[value]?.en ?? value;
}

function fieldMatchesSlug(field: ListingFieldConfig, slug: string): boolean {
  const rules = field.appliesTo;
  if (!rules || rules.length === 0) {
    return true;
  }
  return rules.some((rule) => {
    if (typeof rule === "string") {
      return slug.includes(rule);
    }
    return rule.test(slug);
  });
}

export function getCategoryFieldsForSlug(slug: string): ListingFieldConfig[] {
  const key = resolveCategoryConfigKey(slug);
  if (!key) {
    return [];
  }
  return categoryConfig[key].fields.filter((field) => fieldMatchesSlug(field, slug));
}

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
