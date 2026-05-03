import {
  isElectronicsBrandSlug,
  isFashionSlug,
  isJobSlug,
  isLaptopPcSlug,
  isMotoLikeSlug,
  isPhoneTabletSlug,
  isRealEstateSlug,
  isVehicleWithOdometer,
} from "@/lib/listing-profiles";
import { getModelsForBrand } from "@/lib/vehicle-models-by-brand";
import { VEHICLE_BRANDS } from "@/lib/vehicle-taxonomy";
import listingDynamicFields from "@/config/listing-dynamic-fields.json";
import { SIM_TYPE_OPTIONS } from "@/lib/listing-form-options";
import { allSamsungPhoneModels, APPLE_IPHONE_MODELS } from "@/lib/marketplace-phone-model-lists";

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
  SIM_TYPE_OPTIONS: [...SIM_TYPE_OPTIONS],
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
      label: "",
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

/** Fallback static (fără catalog DB): modele separate — nu amesteca telefon cu laptop. */
const ELECTRONICS_PHONE_MODELS: Record<string, readonly string[]> = {
  Apple: [...APPLE_IPHONE_MODELS],
  Samsung: [...allSamsungPhoneModels()],
  Google: ["Pixel 7", "Pixel 8", "Pixel 9"],
  Xiaomi: ["Redmi Note 13", "Xiaomi 14"],
  OnePlus: ["OnePlus 11", "OnePlus 12"],
  Huawei: ["P60 Pro", "Mate 50"],
  Lenovo: ["Legion Phone Duel", "Legion Y90"],
};

const ELECTRONICS_LAPTOP_MODELS: Record<string, readonly string[]> = {
  Apple: ["MacBook Air M2", "MacBook Air M3", "MacBook Pro 14\"", "MacBook Pro 16\""],
  Samsung: ["Galaxy Book3", "Galaxy Book4"],
  Lenovo: ["ThinkPad X1 Carbon", "ThinkPad T14", "Legion 5", "IdeaPad 5"],
  ASUS: ["VivoBook 15", "ZenBook 14", "ROG Strix G16"],
  Dell: ["XPS 13", "XPS 15", "Latitude 7430", "G15"],
  HP: ["Pavilion 15", "Envy 16", "Spectre x360 14", "OMEN 16"],
};

const ELECTRONICS_STATIC_BRANDS = Array.from(
  new Set([...Object.keys(ELECTRONICS_PHONE_MODELS), ...Object.keys(ELECTRONICS_LAPTOP_MODELS)]),
).sort((a, b) => a.localeCompare(b));

const ELECTRONICS_STATIC_BRAND_SET = new Set(ELECTRONICS_STATIC_BRANDS);

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
  batteryHealth: { ro: "Sănătate baterie", ru: "Состояние батареи", en: "Battery health" },
  smartFeatures: { ro: "Funcții inteligente", ru: "Умные функции", en: "Smart features" },
  refreshRateHz: { ro: "Rată refresh (Hz)", ru: "Частота обновления (Гц)", en: "Refresh rate (Hz)" },
  cameraMp: { ro: "Cameră (MP)", ru: "Камера (Мп)", en: "Camera (MP)" },
  simType: { ro: "Tip SIM", ru: "Тип SIM", en: "SIM type" },
  osType: { ro: "Sistem de operare", ru: "Операционная система", en: "Operating system" },
  connectivity: { ro: "Conectivitate", ru: "Подключение", en: "Connectivity" },
  originalBox: { ro: "Cutie originală", ru: "Оригинальная коробка", en: "Original box" },
  waterResistance: { ro: "Rezistență la apă", ru: "Влагозащита", en: "Water resistance" },
  salary: { ro: "Salariu", ru: "Зарплата", en: "Salary" },
  jobType: { ro: "Tip job", ru: "Тип занятости", en: "Job type" },
  engineType: { ro: "Tip motor", ru: "Тип двигателя", en: "Engine type" },
  sizeLabel: { ro: "Mărime", ru: "Размер", en: "Size" },
  experienceYears: { ro: "Experiență (ani)", ru: "Опыт (лет)", en: "Experience (years)" },
  drivetrain: { ro: "Tracțiune", ru: "Привод", en: "Drivetrain" },
  vin: { ro: "Serie șasiu (VIN)", ru: "VIN / номер кузова", en: "VIN" },
  wheelDriveType: { ro: "Tip tracțiune", ru: "Тип привода колёс", en: "Wheel drive" },
  material: { ro: "Material", ru: "Материал", en: "Material" },
  forGender: { ro: "Destinat pentru", ru: "Для кого", en: "For" },
  season: { ro: "Sezon", ru: "Сезон", en: "Season" },
  colorway: { ro: "Nuanță / paletă", ru: "Расцветка", en: "Colorway" },
  workSchedule: { ro: "Program de lucru", ru: "График работы", en: "Work schedule" },
  educationLevel: { ro: "Nivel de studii", ru: "Уровень образования", en: "Education level" },
  languageLevel: { ro: "Nivel limbă străină", ru: "Уровень языка", en: "Language level" },
  contractDurationMonths: { ro: "Durată contract (luni)", ru: "Срок контракта (мес.)", en: "Contract duration (months)" },
  remotePolicy: { ro: "Mod de lucru (la distanță)", ru: "Удалённая работа", en: "Remote policy" },
  livingAreaSqm: { ro: "Suprafață locuibilă (m²)", ru: "Жилая площадь (м²)", en: "Living area (m²)" },
  kitchenAreaSqm: { ro: "Suprafață bucătărie (m²)", ru: "Площадь кухни (м²)", en: "Kitchen area (m²)" },
  renovationType: { ro: "Stare finisaje / renovare", ru: "Отделка / ремонт", en: "Renovation / finish" },
  fitType: { ro: "Croi / potrivire", ru: "Посадка / крой", en: "Fit" },
  waistCm: { ro: "Talie (cm)", ru: "Талия (см)", en: "Waist (cm)" },
  lengthCm: { ro: "Lungime (cm)", ru: "Длина (см)", en: "Length (cm)" },
  shoeSizeEu: { ro: "Mărime pantof (EU)", ru: "Размер обуви (EU)", en: "Shoe size (EU)" },
  companyType: { ro: "Formă juridică / tip companie", ru: "Тип компании", en: "Company type" },
  industry: { ro: "Domeniu / industrie", ru: "Отрасль", en: "Industry" },
  positionsOpen: { ro: "Număr posturi deschise", ru: "Открытых вакансий", en: "Open positions" },
  benefits: { ro: "Beneficii oferite", ru: "Льготы", en: "Benefits" },
  driverLicenseRequired: { ro: "Permis de conducere necesar", ru: "Нужны права", en: "Driver license required" },
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
  phone: { ro: "Telefon mobil", ru: "Смартфон", en: "Phone" },
  smartphone: { ro: "Smartphone", ru: "Смартфон", en: "Smartphone" },
  classic_phone: { ro: "Telefon clasic", ru: "Кнопочный телефон", en: "Classic phone" },
  smartwatch: { ro: "Smartwatch", ru: "Смарт-часы", en: "Smartwatch" },
  desktop: { ro: "Unitate PC", ru: "Системный блок", en: "Desktop" },
  peripherals: { ro: "Periferice", ru: "Периферия", en: "Peripherals" },
  retea: { ro: "Rețea", ru: "Сеть", en: "Networking" },
  imprimante: { ro: "Imprimante", ru: "Принтеры", en: "Printers" },
  other: { ro: "Altul", ru: "Другое", en: "Other" },
  laptop: { ro: "Laptop", ru: "Ноутбук", en: "Laptop" },
  pc: { ro: "PC / sistem", ru: "ПК / системный блок", en: "PC / desktop" },
  tablet: { ro: "Tabletă", ru: "Планшет", en: "Tablet" },
  monitor: { ro: "Monitor", ru: "Монитор", en: "Monitor" },
  tv: { ro: "Televizor", ru: "Телевизор", en: "TV" },
  components: { ro: "Componente", ru: "Комплектующие", en: "Components" },
  accessories: { ro: "Accesorii", ru: "Аксессуары", en: "Accessories" },
  nano_sim: { ro: "Nano-SIM", ru: "Nano-SIM", en: "Nano-SIM" },
  esim: { ro: "eSIM", ru: "eSIM", en: "eSIM" },
  dual_sim: { ro: "Dual SIM", ru: "Dual SIM", en: "Dual SIM" },
  hybrid_slot: { ro: "Slot hibrid (SIM + card)", ru: "Гибридный слот", en: "Hybrid slot" },
  no_sim: { ro: "Fără SIM (Wi‑Fi only)", ru: "Без SIM (только Wi‑Fi)", en: "No SIM (Wi‑Fi only)" },
  ios: { ro: "iOS", ru: "iOS", en: "iOS" },
  android: { ro: "Android", ru: "Android", en: "Android" },
  windows: { ro: "Windows", ru: "Windows", en: "Windows" },
  macos: { ro: "macOS", ru: "macOS", en: "macOS" },
  linux: { ro: "Linux", ru: "Linux", en: "Linux" },
  altul: { ro: "Altul", ru: "Другое", en: "Other" },
  wifi: { ro: "Wi‑Fi", ru: "Wi‑Fi", en: "Wi‑Fi" },
  "4g": { ro: "4G", ru: "4G", en: "4G" },
  "5g": { ro: "5G", ru: "5G", en: "5G" },
  bluetooth: { ro: "Bluetooth", ru: "Bluetooth", en: "Bluetooth" },
  nfc: { ro: "NFC", ru: "NFC", en: "NFC" },
  gps: { ro: "GPS", ru: "GPS", en: "GPS" },
  partial: { ro: "Parțial", ru: "Частично", en: "Partial" },
  "3-months": { ro: "3 luni", ru: "3 мес.", en: "3 months" },
  "6-months": { ro: "6 luni", ru: "6 мес.", en: "6 months" },
  "12-months": { ro: "12 luni", ru: "12 мес.", en: "12 months" },
  "24-months+": { ro: "24+ luni", ru: "24+ мес.", en: "24+ months" },
  "2t": { ro: "Două timpi (2T)", ru: "Двухтактный", en: "Two-stroke" },
  "4t": { ro: "Patru timpi (4T)", ru: "Четырёхтактный", en: "Four-stroke" },
  "ground-floor": { ro: "Parter", ru: "Первый этаж (партер)", en: "Ground floor" },
  "5+": { ro: "Etaj 5+", ru: "5+ этаж", en: "Floor 5+" },
  "top-floor": { ro: "Ultimul etaj", ru: "Последний этаж", en: "Top floor" },
  attic: { ro: "Mansardă", ru: "Мансарда", en: "Attic" },
  "euro-3": { ro: "Euro 3", ru: "Евро-3", en: "Euro 3" },
  "euro-4": { ro: "Euro 4", ru: "Евро-4", en: "Euro 4" },
  "euro-5": { ro: "Euro 5", ru: "Евро-5", en: "Euro 5" },
  "euro-6": { ro: "Euro 6", ru: "Евро-6", en: "Euro 6" },
  "euro-6d": { ro: "Euro 6d", ru: "Евро-6d", en: "Euro 6d" },
  zero: { ro: "Zero emisii", ru: "Нулевые выбросы", en: "Zero emissions" },
  "gas-central": { ro: "Centrală pe gaz", ru: "Газовое отопление", en: "Gas central heating" },
  "electric-central": { ro: "Centrală electrică", ru: "Электроотопление", en: "Electric central heating" },
  "district-heating": { ro: "Termoficare / agent termic", ru: "Центральное тепло", en: "District heating" },
  stove: { ro: "Sobă / convectoare", ru: "Печь / конвекторы", en: "Stove / heaters" },
  "heat-pump": { ro: "Pompă de căldură", ru: "Тепловой насос", en: "Heat pump" },
  garage: { ro: "Garaj", ru: "Гараж", en: "Garage" },
  "underground-parking": { ro: "Parcare subterană", ru: "Подземная парковка", en: "Underground parking" },
  "outdoor-parking": { ro: "Parcare exterioară", ru: "Наружная парковка", en: "Outdoor parking" },
  "A+": { ro: "A+", ru: "A+", en: "A+" },
  A: { ro: "A", ru: "A", en: "A" },
  B: { ro: "B", ru: "B", en: "B" },
  C: { ro: "C", ru: "C", en: "C" },
  D: { ro: "D", ru: "D", en: "D" },
  E: { ro: "E", ru: "E", en: "E" },
  F: { ro: "F", ru: "F", en: "F" },
  G: { ro: "G", ru: "G", en: "G" },
  "shell-and-core": { ro: "La gri / structură", ru: "Под чистовую отделку", en: "Shell and core" },
  complete: { ro: "Renovare completă", ru: "Полный ремонт", en: "Fully renovated" },
  premium: { ro: "Finisaje premium", ru: "Премиум отделка", en: "Premium finish" },
  "not-renovated": { ro: "Nerenovat", ru: "Без ремонта", en: "Not renovated" },
  immediately: { ro: "Imediat", ru: "Сразу", en: "Immediately" },
  "1-week": { ro: "În 1 săptămână", ru: "Через 1 неделю", en: "In 1 week" },
  "2-weeks": { ro: "În 2 săptămâni", ru: "Через 2 недели", en: "In 2 weeks" },
  "1-month": { ro: "În 1 lună", ru: "Через 1 месяц", en: "In 1 month" },
  negotiable: { ro: "Negociabil", ru: "Договорно", en: "Negotiable" },
  cotton: { ro: "Bumbac", ru: "Хлопок", en: "Cotton" },
  wool: { ro: "Lână", ru: "Шерсть", en: "Wool" },
  polyester: { ro: "Poliester", ru: "Полиэстер", en: "Polyester" },
  leather: { ro: "Piele", ru: "Кожа", en: "Leather" },
  denim: { ro: "Denim", ru: "Деним", en: "Denim" },
  linen: { ro: "In", ru: "Лён", en: "Linen" },
  blend: { ro: "Amestec", ru: "Смесь", en: "Blend" },
  men: { ro: "Bărbați", ru: "Мужской", en: "Men" },
  women: { ro: "Femei", ru: "Женский", en: "Women" },
  unisex: { ro: "Unisex", ru: "Унисекс", en: "Unisex" },
  kids: { ro: "Copii", ru: "Детский", en: "Kids" },
  spring: { ro: "Primăvară", ru: "Весна", en: "Spring" },
  summer: { ro: "Vară", ru: "Лето", en: "Summer" },
  autumn: { ro: "Toamnă", ru: "Осень", en: "Autumn" },
  winter: { ro: "Iarnă", ru: "Зима", en: "Winter" },
  "all-season": { ro: "Tot sezonul", ru: "Всесезонный", en: "All season" },
  "full-time": { ro: "Normă întreagă", ru: "Полная занятость", en: "Full-time" },
  "part-time": { ro: "Cu jumătate de normă", ru: "Частичная занятость", en: "Part-time" },
  flexible: { ro: "Program flexibil", ru: "Гибкий график", en: "Flexible" },
  shift: { ro: "Schimburi", ru: "Сменный график", en: "Shift work" },
  weekend: { ro: "Weekend", ru: "Выходные", en: "Weekends" },
  remote: { ro: "Remote / la distanță", ru: "Удалённо", en: "Remote" },
  contract: { ro: "Contract", ru: "Контракт", en: "Contract" },
  internship: { ro: "Internship / practică", ru: "Стажировка", en: "Internship" },
  "high-school": { ro: "Liceu", ru: "Школа", en: "High school" },
  college: { ro: "Colegiu / postliceal", ru: "Колледж", en: "College" },
  bachelor: { ro: "Licență", ru: "Бакалавр", en: "Bachelor" },
  master: { ro: "Masterat", ru: "Магистр", en: "Master" },
  doctorate: { ro: "Doctorat", ru: "Докторантура", en: "Doctorate" },
  A1: { ro: "A1", ru: "A1", en: "A1" },
  A2: { ro: "A2", ru: "A2", en: "A2" },
  B1: { ro: "B1", ru: "B1", en: "B1" },
  B2: { ro: "B2", ru: "B2", en: "B2" },
  C1: { ro: "C1", ru: "C1", en: "C1" },
  C2: { ro: "C2", ru: "C2", en: "C2" },
  native: { ro: "Nativ", ru: "Родной", en: "Native" },
  "on-site": { ro: "La birou", ru: "В офисе", en: "On-site" },
  llc: { ro: "SRL / LLC", ru: "ООО", en: "LLC" },
  "joint-stock": { ro: "SA / joint-stock", ru: "АО", en: "Joint stock" },
  "sole-trader": { ro: "Întreprinzător individual", ru: "ИП", en: "Sole trader" },
  "individual-entrepreneur": { ro: "Antreprenor individual", ru: "Частный предприниматель", en: "Individual entrepreneur" },
  ngo: { ro: "ONG", ru: "НКО", en: "NGO" },
  it: { ro: "IT / software", ru: "IT", en: "IT" },
  sales: { ro: "Vânzări", ru: "Продажи", en: "Sales" },
  marketing: { ro: "Marketing", ru: "Маркетинг", en: "Marketing" },
  logistics: { ro: "Logistică", ru: "Логистика", en: "Logistics" },
  construction: { ro: "Construcții", ru: "Строительство", en: "Construction" },
  automotive: { ro: "Auto / transport", ru: "Авто", en: "Automotive" },
  finance: { ro: "Finanțe", ru: "Финансы", en: "Finance" },
  hospitality: { ro: "HoReCa", ru: "Гостеприимство", en: "Hospitality" },
  medical: { ro: "Medical / sănătate", ru: "Медицина", en: "Medical" },
  education: { ro: "Educație", ru: "Образование", en: "Education" },
  "intel-i3": { ro: "Intel Core i3", ru: "Intel Core i3", en: "Intel Core i3" },
  "intel-i5": { ro: "Intel Core i5", ru: "Intel Core i5", en: "Intel Core i5" },
  "intel-i7": { ro: "Intel Core i7", ru: "Intel Core i7", en: "Intel Core i7" },
  "intel-i9": { ro: "Intel Core i9", ru: "Intel Core i9", en: "Intel Core i9" },
  "amd-ryzen3": { ro: "AMD Ryzen 3", ru: "AMD Ryzen 3", en: "AMD Ryzen 3" },
  "amd-ryzen5": { ro: "AMD Ryzen 5", ru: "AMD Ryzen 5", en: "AMD Ryzen 5" },
  "amd-ryzen7": { ro: "AMD Ryzen 7", ru: "AMD Ryzen 7", en: "AMD Ryzen 7" },
  "apple-m1": { ro: "Apple M1", ru: "Apple M1", en: "Apple M1" },
  "apple-m2": { ro: "Apple M2", ru: "Apple M2", en: "Apple M2" },
  "apple-m3": { ro: "Apple M3", ru: "Apple M3", en: "Apple M3" },
  integrata: { ro: "Integrată", ru: "Встроенная", en: "Integrated" },
  "nvidia-gtx": { ro: "NVIDIA GeForce GTX", ru: "NVIDIA GTX", en: "NVIDIA GTX" },
  "nvidia-rtx": { ro: "NVIDIA GeForce RTX", ru: "NVIDIA RTX", en: "NVIDIA RTX" },
  "amd-radeon": { ro: "AMD Radeon", ru: "AMD Radeon", en: "AMD Radeon" },
  "apple-gpu": { ro: "GPU Apple", ru: "GPU Apple", en: "Apple GPU" },
  XS: { ro: "XS", ru: "XS", en: "XS" },
  S: { ro: "S", ru: "S", en: "S" },
  M: { ro: "M", ru: "M", en: "M" },
  L: { ro: "L", ru: "L", en: "L" },
  XL: { ro: "XL", ru: "XL", en: "XL" },
  XXL: { ro: "XXL", ru: "XXL", en: "XXL" },
  white: { ro: "Alb", ru: "Белый", en: "White" },
  black: { ro: "Negru", ru: "Чёрный", en: "Black" },
  gray: { ro: "Gri", ru: "Серый", en: "Gray" },
  silver: { ro: "Argintiu", ru: "Серебристый", en: "Silver" },
  blue: { ro: "Albastru", ru: "Синий", en: "Blue" },
  red: { ro: "Roșu", ru: "Красный", en: "Red" },
  green: { ro: "Verde", ru: "Зелёный", en: "Green" },
  beige: { ro: "Bej", ru: "Бежевый", en: "Beige" },
  brown: { ro: "Maro", ru: "Коричневый", en: "Brown" },
  orange: { ro: "Portocaliu", ru: "Оранжевый", en: "Orange" },
  yellow: { ro: "Galben", ru: "Жёлтый", en: "Yellow" },
  MD: { ro: "Republica Moldova", ru: "Молдова", en: "Moldova" },
  RO: { ro: "România", ru: "Румыния", en: "Romania" },
  DE: { ro: "Germania", ru: "Германия", en: "Germany" },
  IT: { ro: "Italia", ru: "Италия", en: "Italy" },
  FR: { ro: "Franța", ru: "Франция", en: "France" },
  NL: { ro: "Țările de Jos", ru: "Нидерланды", en: "Netherlands" },
  BE: { ro: "Belgia", ru: "Бельгия", en: "Belgium" },
  BG: { ro: "Bulgaria", ru: "Болгария", en: "Bulgaria" },
  UA: { ro: "Ucraina", ru: "Украина", en: "Ukraine" },
  slim: { ro: "Slim / strâmt", ru: "Slim", en: "Slim" },
  regular: { ro: "Regular", ru: "Обычная", en: "Regular" },
  oversize: { ro: "Oversize", ru: "Оверсайз", en: "Oversize" },
  relaxed: { ro: "Relaxed", ru: "Свободный", en: "Relaxed" },
  skinny: { ro: "Skinny", ru: "Скинни", en: "Skinny" },
  fwd: { ro: "Tracțiune față", ru: "Передний привод", en: "FWD" },
  rwd: { ro: "Tracțiune spate", ru: "Задний привод", en: "RWD" },
  awd: { ro: "Tracțiune integrală (AWD)", ru: "AWD", en: "AWD" },
  "4wd": { ro: "4×4", ru: "4×4", en: "4WD" },
  mpv: { ro: "Monovolum", ru: "Минивэн", en: "MPV" },
  studio: { ro: "Garsonieră", ru: "Студия", en: "Studio" },
  basement: { ro: "Subsol", ru: "Подвал", en: "Basement" },
  ground: { ro: "Parter", ru: "Первый этаж", en: "Ground floor" },
  "21plus": { ro: "Peste 20", ru: "Более 20", en: "21+" },
  good: { ro: "Bună", ru: "Хорошее", en: "Good" },
  livable: { ro: "Locuibilă", ru: "Жилое", en: "Livable" },
  needs_renovation: { ro: "Necesită renovare", ru: "Нужен ремонт", en: "Needs renovation" },
  shell: { ro: "La roșu", ru: "Под отделку", en: "Shell" },
  forest: { ro: "Pădure", ru: "Лес", en: "Forest" },
  agricultural: { ro: "Teren agricol", ru: "Сельхозугодья", en: "Agricultural" },
};

export function resolveListingUiLocale(locale: string): ListingUiLocale {
  const l = locale.toLowerCase();
  if (l.startsWith("ru")) return "ru";
  if (l.startsWith("ro")) return "ro";
  return "en";
}

export function getLocalizedFieldLabel(fieldId: ListingFieldId, locale: string): string {
  const lang = resolveListingUiLocale(locale);
  const row = FIELD_LABELS[fieldId];
  if (row) {
    return row[lang] ?? row.en;
  }
  return fieldId;
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
  if (key === "electronice") {
    return [...ELECTRONICS_STATIC_BRANDS];
  }
  return Object.keys(categoryConfig[key].brands ?? {});
}

export function getModelsForCategoryBrand(
  key: ListingCategoryKey | null,
  brand: string,
  categorySlug?: string,
): string[] {
  if (!key || !brand.trim()) {
    return [];
  }
  if (key === "auto") {
    return [...getModelsForBrand(brand)];
  }
  if (key === "electronice") {
    const slug = categorySlug?.trim() ?? "";
    if (slug && isPhoneTabletSlug(slug)) {
      const models = ELECTRONICS_PHONE_MODELS[brand];
      return models ? [...models] : [];
    }
    if (slug && isLaptopPcSlug(slug)) {
      const models = ELECTRONICS_LAPTOP_MODELS[brand];
      return models ? [...models] : [];
    }
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
  if (key === "auto") {
    return VEHICLE_BRANDS.includes(normalizedBrand as (typeof VEHICLE_BRANDS)[number]);
  }
  if (key === "electronice") {
    return ELECTRONICS_STATIC_BRAND_SET.has(normalizedBrand);
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
  categorySlug?: string,
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
  const allowedModels = getModelsForCategoryBrand(key, brand, categorySlug);
  return allowedModels.includes(normalizedModel);
}
