import type { CatDef } from "./types";
import { leaf, section } from "./types";

const M = "moda";

export const modaRoot: CatDef = {
  slug: "moda",
  ro: "Modă (îmbrăcăminte & încălțăminte)",
  ru: "Мода (одежда и обувь)",
  en: "Fashion",
  children: [
    section(M, "barbati", "Bărbați", [
      leaf(M, "barbati-haine", "Haine", "Одежда", "Clothing"),
      leaf(M, "barbati-incalt", "Încălțăminte", "Обувь", "Shoes"),
      leaf(M, "barbati-accesorii", "Ceasuri, ochelari, genți", "Аксессуары", "Accessories"),
    ]),
    section(M, "femei", "Femei", [
      leaf(M, "femei-haine", "Haine", "Одежда", "Clothing"),
      leaf(M, "femei-incalt", "Încălțăminte", "Обувь", "Shoes"),
      leaf(M, "femei-accesorii", "Genți, bijuterii fashion, ceasuri", "Аксессуары", "Accessories"),
    ]),
    section(M, "copii-moda", "Copii", [
      leaf(M, "copii-haine", "Haine copii", "Детская одежда", "Kids clothes"),
      leaf(M, "copii-incalt", "Încălțăminte copii", "Детская обувь", "Kids shoes"),
      leaf(M, "scolare", "Ghiozdane, uniforme", "Школа", "School wear"),
    ]),
    section(M, "sport-moda", "Sport și outdoor (textile)", [
      leaf(M, "textile-sport", "Textile sport și înot", "Спортодежда", "Sportswear"),
    ]),
  ],
};

const SP = "sport";

export const sportRoot: CatDef = {
  slug: "sport-hobby",
  ro: "Sport & hobby",
  ru: "Спорт и хобби",
  en: "Sports & hobby",
  children: [
    section(SP, "fitness", "Fitness și sală", [
      leaf(SP, "greutati", "Greutăți, bare, benzi", "Гантели", "Weights"),
      leaf(SP, "biciclete", "Biciclete", "Велосипеды", "Bikes"),
      leaf(SP, "trotinete", "Trotinete electrice", "Самокаты", "Scooters"),
      leaf(SP, "benzi-alergare", "Benzi de alergare, biciclete fitness", "Кардио", "Cardio machines"),
    ]),
    section(SP, "sporturi", "Sporturi de echipă și individual", [
      leaf(SP, "fotbal", "Fotbal", "Футбол", "Football"),
      leaf(SP, "tenis", "Tenis, badminton, squash", "Теннис", "Racket sports"),
      leaf(SP, "sporturi-iarna", "Schi, snowboard, patinaj", "Зимний спорт", "Winter sports"),
      leaf(SP, "inot", "Înot și aquafitness", "Плавание", "Swimming"),
      leaf(SP, "sporturi-acvatice", "Sporturi nautice (kayak, windsurf)", "Водный спорт", "Water sports"),
    ]),
    section(SP, "outdoor", "Outdoor și camping", [
      leaf(SP, "corturi", "Corturi, saci de dormit, izopren", "Палатки", "Camping"),
      leaf(SP, "drumetii", "Drumeții, rucsacuri, bețe", "Туризм", "Hiking"),
      leaf(SP, "pescuit", "Pescuit și vânătoare", "Рыбалка", "Fishing"),
    ]),
    section(SP, "colectii", "Colecții și jocuri", [
      leaf(SP, "numismatica", "Numismatică și filatelie", "Нумизматика", "Coins"),
      leaf(SP, "machete", "Machete, modele, puzzle", "Модели", "Models"),
      leaf(SP, "jocuri-societate", "Jocuri de societate", "Настолки", "Board games"),
    ]),
  ],
};

const A = "animale";

export const animaleRoot: CatDef = {
  slug: "animale",
  ro: "Animale & plante",
  ru: "Животные и растения",
  en: "Pets & plants",
  children: [
    section(A, "caini", "Câini", [
      leaf(A, "caini-vanzare", "Câini — vânzare / adopție", "Собаки", "Dogs"),
      leaf(A, "accesorii-caine", "Hrană și accesorii câini", "Аксессуары", "Dog supplies"),
    ]),
    section(A, "pisici", "Pisici", [
      leaf(A, "pisici-vanzare", "Pisici — vânzare / adopție", "Кошки", "Cats"),
      leaf(A, "accesorii-pisica", "Litieră, hrană pisici", "Аксессуары", "Cat supplies"),
    ]),
    section(A, "pasari-rozatoare", "Păsări, rozătoare, exotice", [
      leaf(A, "pasari-vanzare", "Păsări", "Птицы", "Birds"),
      leaf(A, "rozatoare", "Hamsteri, iepuri decorativi", "Грызуны", "Rodents"),
      leaf(A, "acvariu", "Acvaristică (pești, plante acvatice)", "Аквариум", "Aquarium"),
      leaf(A, "reptile", "Reptile și terarii", "Рептилии", "Reptiles"),
    ]),
    section(A, "plant", "Plante și grădină", [
      leaf(A, "flori", "Flori, răsaduri, semințe", "Цветы", "Flowers"),
      leaf(A, "pomi", "Pomi fructiferi și arbuști", "Деревья", "Trees"),
    ]),
    section(A, "servicii-animale", "Servicii", [
      leaf(A, "dresaj", "Dresaj canin", "Дрессировка", "Training"),
      leaf(A, "vet", "Clinici veterinare / grooming", "Ветеринар", "Vet & grooming"),
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
    section(AG, "cereale", "Cereale, furaje, semințe", [
      leaf(AG, "furaje", "Furaje combinate", "Корма", "Feed"),
      leaf(AG, "seminte", "Sămânță certificată", "Семена", "Seeds"),
      leaf(AG, "cereale-bulk", "Cereale în vrac", "Зерно", "Grain"),
    ]),
    section(AG, "livestock", "Animale de fermă", [
      leaf(AG, "vite", "Bovine", "КРС", "Cattle"),
      leaf(AG, "oi", "Ovine și caprine", "Овцы/козы", "Sheep/goats"),
      leaf(AG, "porci", "Porci", "Свиньи", "Pigs"),
      leaf(AG, "pui", "Păsări de curte", "Птица", "Poultry"),
    ]),
    section(AG, "echipamente", "Echipamente agricole", [
      leaf(AG, "tractoare", "Tractoare și remorci agricole", "Тракторы", "Tractors"),
      leaf(AG, "cositoare", "Cositoare, greble, tocătoare", "Косилки", "Mowers"),
      leaf(AG, "pluguri", "Pluguri și cultivatoare", "Плуги", "Plows"),
      leaf(AG, "irigatii-agro", "Sisteme irigații câmp", "Орошение", "Irrigation"),
    ]),
  ],
};

const MC = "mama-copil";

export const mamaCopilRoot: CatDef = {
  slug: "mama-copil",
  ro: "Mamă & copil",
  ru: "Мама и ребёнок",
  en: "Mother & child",
  children: [
    section(MC, "carucioare", "Cărucioare și transport", [
      leaf(MC, "carucior", "Cărucioare", "Коляски", "Strollers"),
      leaf(MC, "scaun-auto", "Scaune auto copii", "Автокресла", "Car seats"),
      leaf(MC, "marsupii", "Marsupii și slinguri", "Слинги", "Baby carriers"),
    ]),
    section(MC, "jucarii", "Jucării și educație", [
      leaf(MC, "jucarii-mici", "Jucării 0–6 ani", "Игрушки", "Toys"),
      leaf(MC, "carti-copii", "Cărți și materiale educative", "Книги", "Books"),
      leaf(MC, "creative", "Desen, modelaj, LEGO", "Творчество", "Creative"),
    ]),
    section(MC, "alaptare", "Alimentație și îngrijire", [
      leaf(MC, "biberoane", "Biberoane, sterilizatoare, pompe", "Бутылочки", "Feeding"),
      leaf(MC, "hrana-bebelusi", "Formule și cereale", "Питание", "Baby food"),
    ]),
    section(MC, "textile-copii", "Textile și mobilier copii", [
      leaf(MC, "patuturi", "Pătuțuri și mobilier", "Кроватки", "Cribs"),
      leaf(MC, "textile-pat", "Lenjerii și protecții saltea", "Текстиль", "Bedding"),
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
      leaf(D, "echipament-studio", "Echipament studio și DJ", "Студия", "Studio gear"),
    ]),
    section(D, "arta", "Artă, handmade, antichități", [
      leaf(D, "tablouri", "Tablouri și sculpturi", "Картины", "Paintings"),
      leaf(D, "handmade", "Handmade și craft", "Рукоделие", "Handmade"),
      leaf(D, "antichitati", "Antichități și vintage", "Антиквариат", "Antiques"),
    ]),
    section(D, "cadouri", "Ceasuri, bijuterii, accesorii", [
      leaf(D, "ceasuri", "Ceasuri", "Часы", "Watches"),
      leaf(D, "bijuterii", "Bijuterii", "Бижутерия", "Jewelry"),
    ]),
    section(D, "carti-media", "Cărți, media, bilete", [
      leaf(D, "carti", "Cărți noi și second-hand", "Книги", "Books"),
      leaf(D, "bilete", "Bilete la evenimente", "Билеты", "Tickets"),
    ]),
    section(D, "altele", "Altele", [
      leaf(D, "nedefinit", "Diverse — alte categorii", "Прочее", "Other"),
    ]),
  ],
};

const B = "business";

export const businessRoot: CatDef = {
  slug: "business",
  ro: "Business & industrie",
  ru: "Бизнес и промышленность",
  en: "Business & industry",
  children: [
    section(B, "echipamente", "Utilaje și echipamente", [
      leaf(B, "linii-productie", "Linii de producție", "Линии", "Production lines"),
      leaf(B, "generatoare", "Generatoare și UPS industrial", "Генераторы", "Generators"),
      leaf(B, "containere", "Containere maritime / modulare", "Контейнеры", "Containers"),
    ]),
    section(B, "horeca-biz", "HoReCa și retail en-gros", [
      leaf(B, "echipamente-bucatarie", "Echipamente bucătării profesionale", "Оборудование", "Kitchen equipment"),
      leaf(B, "rafturi-magazin", "Rafturi și vitrine", "Стеллажи", "Retail fixtures"),
    ]),
    section(B, "comert", "Stocuri și lichidări", [
      leaf(B, "stocuri", "Stocuri en-gros / lichidări", "Остатки", "Stock"),
    ]),
  ],
};
