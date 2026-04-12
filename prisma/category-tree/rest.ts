import type { CatDef } from "./types";
import { leaf, section } from "./types";

const M = "moda";

export const modaRoot: CatDef = {
  slug: "moda",
  ro: "Îmbrăcăminte și încălțăminte",
  ru: "Одежда и обувь",
  en: "Fashion & footwear",
  children: [
    section(M, "barbati", "Bărbați", [
      leaf(M, "barbati-haine", "Haine", "Одежда", "Clothing"),
      leaf(M, "barbati-incalt", "Încălțăminte", "Обувь", "Shoes"),
      leaf(M, "barbati-accesorii", "Accesorii", "Аксессуары", "Accessories"),
    ]),
    section(M, "femei", "Femei", [
      leaf(M, "femei-haine", "Haine", "Одежда", "Clothing"),
      leaf(M, "femei-incalt", "Încălțăminte", "Обувь", "Shoes"),
      leaf(M, "femei-accesorii", "Accesorii", "Аксессуары", "Accessories"),
    ]),
    section(M, "copii-moda", "Copii", [
      leaf(M, "copii-haine", "Haine copii", "Детская одежда", "Kids clothes"),
      leaf(M, "copii-incalt", "Încălțăminte copii", "Детская обувь", "Kids shoes"),
    ]),
  ],
};

const SP = "sport";

export const sportRoot: CatDef = {
  slug: "sport-hobby",
  ro: "Sport și hobby",
  ru: "Спорт и хобби",
  en: "Sports & hobby",
  children: [
    section(SP, "fitness", "Fitness și sală", [
      leaf(SP, "greutati", "Greutăți și bare", "Гантели", "Weights"),
      leaf(SP, "biciclete", "Biciclete", "Велосипеды", "Bikes"),
      leaf(SP, "trotinete", "Trotinete", "Самокаты", "Scooters"),
    ]),
    section(SP, "sporturi", "Sporturi de echipă / individual", [
      leaf(SP, "fotbal", "Fotbal", "Футбол", "Football"),
      leaf(SP, "tenis", "Tenis / badminton", "Теннис", "Tennis"),
      leaf(SP, "sporturi-iarna", "Sporturi de iarnă", "Зимний спорт", "Winter sports"),
    ]),
    section(SP, "outdoor", "Outdoor", [
      leaf(SP, "corturi", "Corturi și saci de dormit", "Палатки", "Camping"),
      leaf(SP, "drumetii", "Drumeții", "Туризм", "Hiking"),
    ]),
    section(SP, "colectii", "Colecții", [
      leaf(SP, "numismatica", "Numismatică", "Нумизматика", "Coins"),
      leaf(SP, "machete", "Machete / modele", "Модели", "Models"),
    ]),
  ],
};

const A = "animale";

export const animaleRoot: CatDef = {
  slug: "animale",
  ro: "Animale de companie și plante",
  ru: "Животные и растения",
  en: "Pets & plants",
  children: [
    section(A, "caini", "Câini", [
      leaf(A, "caini-vanzare", "Câini — vânzare", "Собаки продажа", "Dogs for sale"),
      leaf(A, "accesorii-caine", "Accesorii câini", "Аксессуары", "Dog accessories"),
    ]),
    section(A, "pisici", "Pisici", [
      leaf(A, "pisici-vanzare", "Pisici — vânzare", "Кошки", "Cats"),
      leaf(A, "accesorii-pisica", "Accesorii pisici", "Аксессуары", "Cat accessories"),
    ]),
    section(A, "pasari-rozatoare", "Păsări și rozătoare", [
      leaf(A, "pasari-vanzare", "Păsări", "Птицы", "Birds"),
      leaf(A, "rozatoare", "Rozătoare", "Грызуны", "Rodents"),
    ]),
    section(A, "plant", "Plante", [
      leaf(A, "flori", "Flori și răsaduri", "Цветы", "Flowers"),
      leaf(A, "pomi", "Pomi și arbuști", "Деревья", "Trees"),
    ]),
    section(A, "servicii-animale", "Servicii", [
      leaf(A, "dresaj", "Dresaj", "Дрессировка", "Training"),
      leaf(A, "vet", "Servicii veterinare", "Ветеринар", "Vet"),
    ]),
  ],
};

const AG = "agricol";

export const agricolRoot: CatDef = {
  slug: "agricol",
  ro: "Agricultură",
  ru: "Сельское хозяйство",
  en: "Agriculture",
  children: [
    section(AG, "cereale", "Cereale și furaje", [
      leaf(AG, "furaje", "Furaje", "Корма", "Feed"),
      leaf(AG, "seminte", "Sămânță", "Семена", "Seeds"),
    ]),
    section(AG, "livestock", "Animale de fermă", [
      leaf(AG, "vite", "Bovine", "КРС", "Cattle"),
      leaf(AG, "oi", "Ovine / caprine", "Овцы/козы", "Sheep/goats"),
      leaf(AG, "porci", "Porci", "Свиньи", "Pigs"),
    ]),
    section(AG, "echipamente", "Echipamente agricole", [
      leaf(AG, "tractoare", "Tractoare", "Тракторы", "Tractors"),
      leaf(AG, "cositoare", "Cositoare", "Косилки", "Mowers"),
    ]),
  ],
};

const MC = "mama-copil";

export const mamaCopilRoot: CatDef = {
  slug: "mama-copil",
  ro: "Mamă și copil",
  ru: "Мама и ребёнок",
  en: "Mother & child",
  children: [
    section(MC, "carucioare", "Cărucioare și scaune auto", [
      leaf(MC, "carucior", "Cărucioare", "Коляски", "Strollers"),
      leaf(MC, "scaun-auto", "Scaune auto copii", "Автокресла", "Car seats"),
    ]),
    section(MC, "jucarii", "Jucării și educație", [
      leaf(MC, "jucarii-mici", "Jucării 0–3 ani", "Игрушки", "Toys"),
      leaf(MC, "carti-copii", "Cărți copii", "Книги", "Books"),
    ]),
    section(MC, "alaptare", "Alăptare și îngrijire", [
      leaf(MC, "biberoane", "Biberoane, sterilizatoare", "Бутылочки", "Bottles"),
    ]),
  ],
};

const D = "diverse";

export const diverseRoot: CatDef = {
  slug: "diverse",
  ro: "Diverse",
  ru: "Разное",
  en: "Miscellaneous",
  children: [
    section(D, "muzica", "Muzică", [
      leaf(D, "instrumente", "Instrumente muzicale", "Инструменты", "Instruments"),
      leaf(D, "echipament-studio", "Echipament studio", "Студия", "Studio gear"),
    ]),
    section(D, "arta", "Artă și handmade", [
      leaf(D, "tablouri", "Tablouri", "Картины", "Paintings"),
      leaf(D, "handmade", "Handmade", "Рукоделие", "Handmade"),
    ]),
    section(D, "cadouri", "Cadouri", [
      leaf(D, "ceasuri", "Ceasuri", "Часы", "Watches"),
      leaf(D, "bijuterii", "Bijuterii", "Бижутерия", "Jewelry"),
    ]),
    section(D, "altele", "Altele", [
      leaf(D, "nedefinit", "Diverse nedefinite", "Прочее", "Other"),
    ]),
  ],
};

const B = "business";

export const businessRoot: CatDef = {
  slug: "business",
  ro: "Business și industrie",
  ru: "Бизнес и промышленность",
  en: "Business & industry",
  children: [
    section(B, "echipamente", "Echipamente industriale", [
      leaf(B, "linii-productie", "Linii de producție", "Линии", "Production lines"),
      leaf(B, "generatoare", "Generatoare", "Генераторы", "Generators"),
    ]),
    section(B, "comert", "Comerț en-gros", [
      leaf(B, "stocuri", "Stocuri / lichidări", "Остатки", "Stock"),
    ]),
  ],
};
