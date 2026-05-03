import { APPLE_IPHONE_MODELS, allSamsungPhoneModels } from "./phone-models";

export type CatalogBrandSeed = {
  name: string;
  models: readonly string[];
};

export type CatalogPackSeed = {
  categorySlug: string;
  brands: readonly CatalogBrandSeed[];
};

const GOOGLE_PIXEL_MODELS: readonly string[] = [
  "Pixel 4",
  "Pixel 4a",
  "Pixel 4a (5G)",
  "Pixel 5",
  "Pixel 5a",
  "Pixel 6",
  "Pixel 6 Pro",
  "Pixel 6a",
  "Pixel 7",
  "Pixel 7 Pro",
  "Pixel 7a",
  "Pixel 8",
  "Pixel 8 Pro",
  "Pixel 8a",
  "Pixel 9",
  "Pixel 9 Pro",
  "Pixel 9 Pro XL",
  "Pixel Fold",
];

const XIAOMI_MODELS: readonly string[] = [
  "Redmi Note 11",
  "Redmi Note 12",
  "Redmi Note 13",
  "Redmi Note 14",
  "Redmi 12",
  "Redmi 13",
  "Redmi 14C",
  "POCO F4",
  "POCO F5",
  "POCO F6",
  "POCO F7",
  "POCO X4 Pro",
  "POCO X5",
  "POCO X6",
  "POCO X7",
  "Xiaomi 12",
  "Xiaomi 12T",
  "Xiaomi 13",
  "Xiaomi 13T",
  "Xiaomi 14",
  "Xiaomi 14T",
  "Xiaomi 15",
];

const ONEPLUS_MODELS: readonly string[] = [
  "OnePlus 8",
  "OnePlus 8 Pro",
  "OnePlus 9",
  "OnePlus 9 Pro",
  "OnePlus 10 Pro",
  "OnePlus 11",
  "OnePlus 12",
  "OnePlus 13",
  "OnePlus Nord 2",
  "OnePlus Nord 3",
  "OnePlus Nord 4",
  "OnePlus Nord CE 3",
];

const HUAWEI_MODELS: readonly string[] = [
  "P30",
  "P30 Pro",
  "P40",
  "P40 Pro",
  "P50",
  "P50 Pro",
  "P60 Pro",
  "Mate 30",
  "Mate 40 Pro",
  "Mate 50 Pro",
  "nova 9",
  "nova 10",
  "nova 11",
  "nova 12",
  "nova 13",
];

const IPAD_MODELS: readonly string[] = [
  "iPad (9th gen)",
  "iPad (10th gen)",
  "iPad (11th gen)",
  "iPad mini 6",
  "iPad mini 7",
  "iPad Air (4th gen)",
  "iPad Air (5th gen)",
  "iPad Air 11\" (M2)",
  "iPad Air 13\" (M2)",
  "iPad Pro 11\" (3rd gen)",
  "iPad Pro 11\" (4th gen)",
  "iPad Pro 11\" (M4)",
  "iPad Pro 12.9\" (5th gen)",
  "iPad Pro 12.9\" (6th gen)",
  "iPad Pro 13\" (M4)",
];

const SAMSUNG_TABLET_MODELS: readonly string[] = [
  "Galaxy Tab S6",
  "Galaxy Tab S6 Lite",
  "Galaxy Tab S7",
  "Galaxy Tab S7+",
  "Galaxy Tab S7 FE",
  "Galaxy Tab S8",
  "Galaxy Tab S8+",
  "Galaxy Tab S8 Ultra",
  "Galaxy Tab S9",
  "Galaxy Tab S9+",
  "Galaxy Tab S9 Ultra",
  "Galaxy Tab S9 FE",
  "Galaxy Tab S10+",
  "Galaxy Tab A8",
  "Galaxy Tab A9",
  "Galaxy Tab A9+",
];

const MACBOOK_MODELS: readonly string[] = [
  "MacBook Air (Intel)",
  "MacBook Air M1",
  "MacBook Air M2",
  "MacBook Air M3",
  "MacBook Air M4",
  "MacBook Pro 13\" (Intel)",
  "MacBook Pro 13\" M1",
  "MacBook Pro 13\" M2",
  "MacBook Pro 14\" M1 Pro",
  "MacBook Pro 14\" M2 Pro",
  "MacBook Pro 14\" M3",
  "MacBook Pro 14\" M3 Pro",
  "MacBook Pro 14\" M4",
  "MacBook Pro 14\" M4 Pro",
  "MacBook Pro 16\" M1 Pro",
  "MacBook Pro 16\" M1 Max",
  "MacBook Pro 16\" M2 Pro",
  "MacBook Pro 16\" M2 Max",
  "MacBook Pro 16\" M3 Max",
  "MacBook Pro 16\" M4 Max",
];

const LENOVO_THINKPAD: readonly string[] = [
  "ThinkPad X1 Carbon (Gen 9)",
  "ThinkPad X1 Carbon (Gen 10)",
  "ThinkPad X1 Carbon (Gen 11)",
  "ThinkPad X1 Carbon (Gen 12)",
  "ThinkPad T14 Gen 3",
  "ThinkPad T14 Gen 4",
  "ThinkPad T14 Gen 5",
  "ThinkPad P1 Gen 6",
  "ThinkPad P1 Gen 7",
  "Legion 5",
  "Legion 5 Pro",
  "Legion 7",
  "Legion Slim 5",
  "IdeaPad 3",
  "IdeaPad 5",
  "IdeaPad Slim 5",
];

const ASUS_LAPTOPS: readonly string[] = [
  "VivoBook 15",
  "VivoBook 16",
  "VivoBook S15",
  "ZenBook 14",
  "ZenBook Duo",
  "ROG Strix G15",
  "ROG Strix G16",
  "ROG Zephyrus G14",
  "ROG Zephyrus G16",
  "TUF Gaming F15",
  "TUF Gaming A15",
];

const DELL_LAPTOPS: readonly string[] = [
  "XPS 13",
  "XPS 15",
  "XPS 17",
  "Latitude 5420",
  "Latitude 7430",
  "Inspiron 15",
  "Inspiron 16",
  "G15",
  "G16",
];

const HP_LAPTOPS: readonly string[] = [
  "Pavilion 15",
  "Pavilion Plus 14",
  "Envy 13",
  "Envy 16",
  "Spectre x360 14",
  "Spectre x360 16",
  "OMEN 16",
  "Victus 15",
];

const FASHION_BRANDS: CatalogPackSeed["brands"] = [
  { name: "Nike", models: ["Air Max", "Air Force 1", "Dunk", "Tech Fleece", "Pegasus", "Revolution"] },
  { name: "Adidas", models: ["Ultraboost", "Stan Smith", "Gazelle", "Superstar", "Terrex"] },
  { name: "Zara", models: ["Basic", "Premium", "TRF", "Man"] },
  { name: "Puma", models: ["RS-X", "Suede", "Mayze", "Calibrate"] },
  { name: "New Balance", models: ["574", "550", "2002R", "9060"] },
];

const FASHION_SLUGS = [
  "moda-barbati-haine",
  "moda-femei-haine",
  "moda-copii-haine",
  "moda-barbati-incalt",
  "moda-femei-incalt",
  "moda-copii-incalt",
] as const;

const FASHION_PACKS: readonly CatalogPackSeed[] = FASHION_SLUGS.map((slug) => ({
  categorySlug: slug,
  brands: FASHION_BRANDS,
}));

/** Pachete: categorie frunză (slug) → mărci → modele */
export const MARKETPLACE_CATALOG_PACKS: readonly CatalogPackSeed[] = [
  {
    categorySlug: "electronice-smartphone",
    brands: [
      { name: "Apple", models: APPLE_IPHONE_MODELS },
      { name: "Samsung", models: allSamsungPhoneModels() },
      { name: "Google", models: GOOGLE_PIXEL_MODELS },
      { name: "Xiaomi", models: XIAOMI_MODELS },
      { name: "OnePlus", models: ONEPLUS_MODELS },
      { name: "Huawei", models: HUAWEI_MODELS },
    ],
  },
  {
    categorySlug: "electronice-tablete",
    brands: [
      { name: "Apple", models: IPAD_MODELS },
      { name: "Samsung", models: SAMSUNG_TABLET_MODELS },
      { name: "Xiaomi", models: ["Pad 5", "Pad 6", "Redmi Pad", "Redmi Pad SE", "Redmi Pad Pro"] },
      { name: "Lenovo", models: ["Tab P11", "Tab P12", "Tab M10", "Tab M11", "Yoga Tab 11"] },
    ],
  },
  {
    categorySlug: "electronice-laptop",
    brands: [
      { name: "Apple", models: MACBOOK_MODELS },
      { name: "Lenovo", models: LENOVO_THINKPAD },
      { name: "ASUS", models: ASUS_LAPTOPS },
      { name: "Dell", models: DELL_LAPTOPS },
      { name: "HP", models: HP_LAPTOPS },
      { name: "Samsung", models: ["Galaxy Book2", "Galaxy Book3", "Galaxy Book3 Pro", "Galaxy Book4"] },
    ],
  },
  ...FASHION_PACKS,
];
