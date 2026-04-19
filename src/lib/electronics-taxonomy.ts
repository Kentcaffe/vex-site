export const ELECTRONICS_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Huawei",
  "Google",
  "OnePlus",
  "Oppo",
  "Realme",
  "Motorola",
  "Nokia",
  "Sony",
  "Asus",
  "Lenovo",
  "HP",
  "Dell",
  "Acer",
  "MSI",
  "Microsoft",
] as const;

const MODELS: Record<string, readonly string[]> = {
  Apple: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16", "iPhone SE", "iPad", "MacBook Air", "MacBook Pro"],
  Samsung: ["Galaxy A", "Galaxy S", "Galaxy Note", "Galaxy Z Flip", "Galaxy Z Fold", "Galaxy Tab"],
  Xiaomi: ["Redmi", "POCO", "Mi", "Xiaomi 13", "Xiaomi 14"],
  Huawei: ["P series", "Mate series", "Nova", "Y series"],
  Google: ["Pixel 6", "Pixel 7", "Pixel 8", "Pixel 9"],
  OnePlus: ["Nord", "OnePlus 11", "OnePlus 12"],
  Oppo: ["Reno", "Find", "A series"],
  Realme: ["Number series", "GT", "C series"],
  Motorola: ["Edge", "G series", "E series"],
  Nokia: ["G series", "X series", "C series"],
  Sony: ["Xperia 1", "Xperia 5", "Xperia 10"],
  Asus: ["ROG", "ZenBook", "VivoBook"],
  Lenovo: ["ThinkPad", "IdeaPad", "Legion"],
  HP: ["Pavilion", "Envy", "Spectre", "Omen"],
  Dell: ["XPS", "Inspiron", "Latitude", "Alienware"],
  Acer: ["Aspire", "Swift", "Nitro", "Predator"],
  MSI: ["GF", "Katana", "Stealth", "Raider"],
  Microsoft: ["Surface Pro", "Surface Laptop", "Surface Go"],
};

export function getElectronicsModelsForBrand(brand: string): readonly string[] {
  const b = brand.trim();
  return MODELS[b] ?? [];
}
