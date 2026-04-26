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
      { id: "batteryCapacityKwh", label: "Battery capacity (kWh)", input: "number", min: 5, max: 250, appliesTo: [/transport-electrice/] },
      { id: "rangeKm", label: "Range (km)", input: "number", min: 50, max: 1200, appliesTo: [/transport-electrice/] },
      { id: "fastCharge", label: "Fast charging", input: "select", options: YES_NO_UNKNOWN, appliesTo: [/transport-electrice/] },
      { id: "payloadKg", label: "Payload (kg)", input: "number", min: 100, max: 50_000, appliesTo: [/transport-(camioane|microbuze|autobuze|remorci-auto|rulote)/] },
      { id: "axlesCount", label: "Axles", input: "number", min: 1, max: 10, appliesTo: [/transport-(camioane|autobuze|remorci-auto|rulote)/] },
      { id: "cargoVolumeM3", label: "Cargo volume (m3)", input: "number", min: 1, max: 300, appliesTo: [/transport-(camioane|microbuze|autobuze|remorci-auto|rulote)/] },
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
      { id: "rooms", label: "Rooms", input: "number", min: 1, max: 100, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere)/] },
      { id: "floor", label: "Floor", input: "select", options: FLOOR_OPTIONS, appliesTo: [/imobiliare-(apartamente|garsoniere|camere|birouri|spatii-comerciale|hoteluri)/] },
      { id: "furnished", label: "Furnished", input: "select", options: YES_NO_PARTIAL, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|birouri|spatii-comerciale)/] },
      { id: "buildYear", label: "Build year", input: "number", min: 1800, max: 2030 },
      { id: "landAreaSqm", label: "Land area (sqm)", input: "number", min: 1, max: 999_999_999, appliesTo: [/imobiliare-(teren|case|case-tara|hale-productie|depozite|hoteluri)/] },
      { id: "totalFloors", label: "Total floors", input: "number", min: 1, max: 200, appliesTo: [/imobiliare-(apartamente|garsoniere|camere|case|birouri|spatii-comerciale|depozite|hoteluri|hale-productie)/] },
      { id: "balconies", label: "Balconies", input: "number", min: 0, max: 20, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere)/] },
      { id: "bathrooms", label: "Bathrooms", input: "number", min: 1, max: 30, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|hoteluri)/] },
      { id: "heatingType", label: "Heating type", input: "select", options: HEATING_OPTIONS },
      { id: "parkingType", label: "Parking", input: "select", options: PARKING_OPTIONS },
      { id: "energyClass", label: "Energy class", input: "select", options: ENERGY_CLASS_OPTIONS },
      { id: "livingAreaSqm", label: "Living area (sqm)", input: "number", min: 1, max: 999_999_999, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|case-tara)/] },
      { id: "kitchenAreaSqm", label: "Kitchen area (sqm)", input: "number", min: 1, max: 999_999_999, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|case-tara)/] },
      { id: "renovationType", label: "Renovation level", input: "select", options: RENOVATION_TYPES, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|birouri|spatii-comerciale|depozite|hoteluri|hale-productie)/] },
      { id: "availableFrom", label: "Available from", input: "select", options: DATE_OPTIONS },
      { id: "petsAllowed", label: "Pets allowed", input: "select", options: YES_NO_UNKNOWN },
      { id: "elevator", label: "Elevator", input: "select", options: YES_NO_UNKNOWN, appliesTo: [/imobiliare-(apartamente|garsoniere|camere|birouri|spatii-comerciale|hoteluri)/] },
      { id: "internet", label: "Internet included", input: "select", options: YES_NO_UNKNOWN, appliesTo: [/imobiliare-(apartamente|garsoniere|case|camere|birouri|spatii-comerciale|hoteluri)/] },
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

function humanizeFieldId(fieldId: string): string {
  return fieldId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

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
