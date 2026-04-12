import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "casa";

export const casaRoot: CatDef = {
  slug: "casa-gradina",
  ro: "Casă și grădină",
  ru: "Дом и сад",
  en: "Home & garden",
  children: [
    section(P, "mobila", "Mobilă și interior", [
      leaf(P, "canapele", "Canapele și fotolii", "Диваны", "Sofas"),
      leaf(P, "dormitor", "Dormitor", "Спальня", "Bedroom"),
      leaf(P, "bucatarie-mob", "Mobilă bucătărie", "Кухня", "Kitchen furniture"),
      leaf(P, "birou-mob", "Mobilă birou", "Офисная мебель", "Office furniture"),
      leaf(P, "depozitare", "Dulapuri și depozitare", "Хранение", "Storage"),
    ]),
    section(P, "constructii", "Construcții și reparații", [
      leaf(P, "materiale", "Materiale de construcții", "Материалы", "Building materials"),
      leaf(P, "unelte", "Unelte electrice și manuale", "Инструменты", "Tools"),
      leaf(P, "sanitare", "Sanitare", "Сантехника", "Plumbing"),
      leaf(P, "electrica", "Instalații electrice", "Электрика", "Electrical"),
      leaf(P, "gips-carton", "Gips-carton, vopsea", "Гипсокартон", "Drywall"),
    ]),
    section(P, "gradina-terasa", "Grădină și terasă", [
      leaf(P, "mobilier-gradina", "Mobilier grădină", "Садовая мебель", "Garden furniture"),
      leaf(P, "unelte-gradina", "Unelte grădină", "Садовый инвентарь", "Garden tools"),
      leaf(P, "gratar", "Grătare și accesorii", "Гриль", "BBQ"),
    ]),
    section(P, "decor", "Decor și textile", [
      leaf(P, "perdele", "Perdele și draperii", "Шторы", "Curtains"),
      leaf(P, "covor", "Covoare", "Ковры", "Rugs"),
      leaf(P, "luminat", "Lămpi și corpuri de iluminat", "Свет", "Lighting"),
    ]),
  ],
};

const S = "servicii";

export const serviciiRoot: CatDef = {
  slug: "servicii",
  ro: "Servicii",
  ru: "Услуги",
  en: "Services",
  children: [
    section(S, "auto-serv", "Auto și transport", [
      leaf(S, "reparatii-auto", "Reparații auto", "Авторемонт", "Car repair"),
      leaf(S, "vulcanizare", "Vulcanizare", "Шиномонтаж", "Tire service"),
      leaf(S, "tractari", "Tractări", "Эвакуатор", "Towing"),
      leaf(S, "soferi", "Șoferi / curse", "Водители", "Drivers"),
    ]),
    section(S, "constructii-serv", "Construcții și reparații", [
      leaf(S, "zugravi", "Zugrăveli", "Покраска", "Painting"),
      leaf(S, "faianta", "Faianță / gresie", "Плитка", "Tiling"),
      leaf(S, "montaj", "Montaj mobilă", "Сборка", "Assembly"),
      leaf(S, "electrician", "Electrician", "Электрик", "Electrician"),
    ]),
    section(S, "it", "IT și design", [
      leaf(S, "site-uri", "Creare site-uri", "Сайты", "Websites"),
      leaf(S, "grafica", "Design grafic", "Дизайн", "Graphic design"),
      leaf(S, "reparatii-pc", "Reparații PC / laptop", "Ремонт ПК", "PC repair"),
    ]),
    section(S, "frumusete", "Frumusețe și sănătate", [
      leaf(S, "coafor", "Coafor / frizer", "Парикмахер", "Hair"),
      leaf(S, "cosmetic", "Cosmetică", "Косметология", "Beauty"),
      leaf(S, "masaj", "Masaj", "Массаж", "Massage"),
    ]),
    section(S, "curatenie", "Curățenie și menaj", [
      leaf(S, "curatenie-loc", "Curățenie la domiciliu", "Уборка", "Cleaning"),
      leaf(S, "spalatorie-textile", "Spălătorie textile", "Химчистка", "Laundry"),
    ]),
    section(S, "educatie", "Educație și cursuri", [
      leaf(S, "meditatii", "Meditații / lecții", "Репетитор", "Tutoring"),
      leaf(S, "cursuri", "Cursuri diverse", "Курсы", "Courses"),
    ]),
    section(S, "evenimente", "Evenimente", [
      leaf(S, "foto-video", "Foto / video evenimente", "Фото/видео", "Photo/video"),
      leaf(S, "muzica", "Muzicanți / DJ", "Музыка", "Music"),
    ]),
  ],
};

const J = "joburi";

export const joburiRoot: CatDef = {
  slug: "joburi",
  ro: "Oferte de lucru",
  ru: "Работа",
  en: "Jobs",
  children: [
    section(J, "birou", "Birou și IT", [
      leaf(J, "administrativ", "Administrativ", "Админ", "Admin"),
      leaf(J, "vanzari", "Vânzări", "Продажи", "Sales"),
      leaf(J, "it-job", "IT / software", "IT", "IT"),
      leaf(J, "contabilitate", "Contabilitate", "Бухгалтерия", "Accounting"),
    ]),
    section(J, "productie", "Producție și logistică", [
      leaf(J, "operator", "Operatori linie", "Операторы", "Operators"),
      leaf(J, "sofer-job", "Șoferi", "Водители", "Drivers"),
      leaf(J, "depozit", "Depozit / picking", "Склад", "Warehouse"),
    ]),
    section(J, "servicii-job", "Servicii și retail", [
      leaf(J, "horeca", "HoReCa", "HoReCa", "HoReCa"),
      leaf(J, "retail", "Retail", "Ритейл", "Retail"),
      leaf(J, "ingrijire", "Îngrijire persoane", "Уход", "Care"),
    ]),
    section(J, "constructii-job", "Construcții", [
      leaf(J, "zugrav-job", "Zugravi", "Маляры", "Painters"),
      leaf(J, "electrician-job", "Electricieni", "Электрики", "Electricians"),
    ]),
  ],
};
