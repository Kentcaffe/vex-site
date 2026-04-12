import { prisma } from "../src/lib/prisma";

type Def = {
  slug: string;
  parent: string | null;
  sort: number;
  ro: string;
  ru: string;
  en: string;
};

/** Structură apropiată de un site mare de anunțuri: categorii + subcategorii */
const DEFS: Def[] = [
  // Auto
  { slug: "auto", parent: null, sort: 0, ro: "Auto", ru: "Авто", en: "Cars & vehicles" },
  { slug: "auto-cars", parent: "auto", sort: 0, ro: "Autoturisme", ru: "Легковые", en: "Passenger cars" },
  { slug: "auto-suv", parent: "auto", sort: 1, ro: "SUV & crossover", ru: "Внедорожники", en: "SUV & crossover" },
  { slug: "auto-moto", parent: "auto", sort: 2, ro: "Motociclete & ATV", ru: "Мото и ATV", en: "Motorcycles & ATV" },
  { slug: "auto-trucks", parent: "auto", sort: 3, ro: "Camioane & utilitare", ru: "Грузовики", en: "Trucks & vans" },
  { slug: "auto-parts", parent: "auto", sort: 4, ro: "Piese & accesorii", ru: "Запчасти", en: "Parts & accessories" },
  { slug: "auto-wheels", parent: "auto-parts", sort: 0, ro: "Anvelope & jante", ru: "Шины и диски", en: "Tires & wheels" },
  { slug: "auto-service", parent: "auto", sort: 5, ro: "Servicii auto", ru: "Автоуслуги", en: "Car services" },

  // Imobiliare
  {
    slug: "realestate",
    parent: null,
    sort: 1,
    ro: "Imobiliare",
    ru: "Недвижимость",
    en: "Real estate",
  },
  {
    slug: "realestate-sell",
    parent: "realestate",
    sort: 0,
    ro: "Vânzări",
    ru: "Продажа",
    en: "For sale",
  },
  {
    slug: "realestate-rent",
    parent: "realestate",
    sort: 1,
    ro: "Închirieri",
    ru: "Аренда",
    en: "For rent",
  },
  {
    slug: "realestate-apartments",
    parent: "realestate-sell",
    sort: 0,
    ro: "Apartamente",
    ru: "Квартиры",
    en: "Apartments",
  },
  {
    slug: "realestate-houses",
    parent: "realestate-sell",
    sort: 1,
    ro: "Case",
    ru: "Дома",
    en: "Houses",
  },
  {
    slug: "realestate-land",
    parent: "realestate-sell",
    sort: 2,
    ro: "Terenuri",
    ru: "Участки",
    en: "Land",
  },
  {
    slug: "realestate-commercial",
    parent: "realestate-sell",
    sort: 3,
    ro: "Comercial",
    ru: "Коммерция",
    en: "Commercial",
  },
  {
    slug: "realestate-garages",
    parent: "realestate-sell",
    sort: 4,
    ro: "Garaje & parcări",
    ru: "Гаражи",
    en: "Garages & parking",
  },

  // Electronice
  { slug: "electronics", parent: null, sort: 2, ro: "Electronice", ru: "Электроника", en: "Electronics" },
  { slug: "electronics-phones", parent: "electronics", sort: 0, ro: "Telefoane", ru: "Телефоны", en: "Phones" },
  { slug: "electronics-laptops", parent: "electronics", sort: 1, ro: "Laptopuri & PC", ru: "Ноутбуки", en: "Laptops & PCs" },
  { slug: "electronics-tv", parent: "electronics", sort: 2, ro: "TV & audio", ru: "ТВ и аудио", en: "TV & audio" },
  { slug: "electronics-photo", parent: "electronics", sort: 3, ro: "Foto & video", ru: "Фото", en: "Photo & video" },
  { slug: "electronics-games", parent: "electronics", sort: 4, ro: "Console & jocuri", ru: "Игры", en: "Gaming" },
  { slug: "electronics-appliances", parent: "electronics", sort: 5, ro: "Electrocasnice", ru: "Бытовая техника", en: "Home appliances" },

  // Casă & grădină
  { slug: "home", parent: null, sort: 3, ro: "Casă & grădină", ru: "Дом и сад", en: "Home & garden" },
  { slug: "home-furniture", parent: "home", sort: 0, ro: "Mobilier", ru: "Мебель", en: "Furniture" },
  { slug: "home-repair", parent: "home", sort: 1, ro: "Reparații & unelte", ru: "Ремонт", en: "DIY & tools" },
  { slug: "home-garden", parent: "home", sort: 2, ro: "Grădină", ru: "Сад", en: "Garden" },

  // Modă
  { slug: "fashion", parent: null, sort: 4, ro: "Modă", ru: "Мода", en: "Fashion" },
  { slug: "fashion-clothing", parent: "fashion", sort: 0, ro: "Îmbrăcăminte", ru: "Одежда", en: "Clothing" },
  { slug: "fashion-shoes", parent: "fashion", sort: 1, ro: "Încălțăminte", ru: "Обувь", en: "Shoes" },
  { slug: "fashion-accessories", parent: "fashion", sort: 2, ro: "Accesorii", ru: "Аксессуары", en: "Accessories" },

  // Copii
  { slug: "kids", parent: null, sort: 5, ro: "Copii", ru: "Детские", en: "Kids" },
  { slug: "kids-clothing", parent: "kids", sort: 0, ro: "Haine copii", ru: "Одежда", en: "Kids clothing" },
  { slug: "kids-toys", parent: "kids", sort: 1, ro: "Jucării", ru: "Игрушки", en: "Toys" },
  { slug: "kids-strollers", parent: "kids", sort: 2, ro: "Cărucioare & scaune", ru: "Коляски", en: "Strollers & seats" },

  // Sport
  { slug: "sport", parent: null, sort: 6, ro: "Sport & hobby", ru: "Спорт", en: "Sports & hobby" },

  // Servicii
  { slug: "services", parent: null, sort: 7, ro: "Servicii", ru: "Услуги", en: "Services" },
  { slug: "services-it", parent: "services", sort: 0, ro: "IT & reparații", ru: "IT", en: "IT & repair" },
  { slug: "services-beauty", parent: "services", sort: 1, ro: "Frumusețe & sănătate", ru: "Красота", en: "Beauty & health" },
  { slug: "services-transport", parent: "services", sort: 2, ro: "Transport & mutări", ru: "Перевозки", en: "Transport & moves" },

  // Joburi
  { slug: "jobs", parent: null, sort: 8, ro: "Joburi", ru: "Работа", en: "Jobs" },

  // Animale
  { slug: "animals", parent: null, sort: 9, ro: "Animale", ru: "Животные", en: "Pets & animals" },

  // Afaceri
  { slug: "business", parent: null, sort: 10, ro: "Afaceri & echipamente", ru: "Бизнес", en: "Business equipment" },

  // Diverse
  { slug: "other", parent: null, sort: 11, ro: "Diverse", ru: "Разное", en: "Other" },
];

function byDepth(defs: Def[]): Def[] {
  const map = new Map(defs.map((d) => [d.slug, d]));
  function depth(slug: string): number {
    const d = map.get(slug);
    if (!d) {
      return 0;
    }
    if (!d.parent) {
      return 0;
    }
    return 1 + depth(d.parent);
  }
  return [...defs].sort((a, b) => depth(a.slug) - depth(b.slug));
}

async function main() {
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();

  const idBySlug = new Map<string, string>();
  for (const d of byDepth(DEFS)) {
    const parentId = d.parent ? idBySlug.get(d.parent) : null;
    if (d.parent && !parentId) {
      throw new Error(`Parent missing for ${d.slug} -> ${d.parent}`);
    }
    const row = await prisma.category.create({
      data: {
        slug: d.slug,
        parentId: parentId ?? null,
        sortOrder: d.sort,
        labels: JSON.stringify({ ro: d.ro, ru: d.ru, en: d.en }),
      },
    });
    idBySlug.set(d.slug, row.id);
  }

  console.log(`Seed: ${idBySlug.size} categorii.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
