import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "casa";

export const casaRoot: CatDef = {
  slug: "casa-gradina",
  ro: "Casă & grădină",
  ru: "Дом и сад",
  en: "Home & garden",
  children: [
    section(P, "mobila", "Mobilă și interior", [
      leaf(P, "canapele", "Canapele și fotolii", "Диваны", "Sofas"),
      leaf(P, "dormitor", "Dormitor (paturi, noptiere)", "Спальня", "Bedroom"),
      leaf(P, "bucatarie-mob", "Mobilă bucătărie", "Кухня", "Kitchen furniture"),
      leaf(P, "birou-mob", "Mobilă birou", "Офисная мебель", "Office furniture"),
      leaf(P, "depozitare", "Dulapuri, rafturi, depozitare", "Хранение", "Storage"),
      leaf(P, "scari-usi", "Uși, ferestre, scări interioare", "Двери и окна", "Doors & windows"),
    ]),
    section(P, "constructii", "Construcții, reparații, finisaje", [
      leaf(P, "materiale", "Materiale de construcții", "Материалы", "Building materials"),
      leaf(P, "unelte", "Unelte electrice și manuale", "Инструменты", "Tools"),
      leaf(P, "sanitare", "Sanitare și țevi", "Сантехника", "Plumbing"),
      leaf(P, "electrica", "Instalații electrice și tablouri", "Электрика", "Electrical"),
      leaf(P, "gips-carton", "Gips-carton, vopsea, tencuieli", "Гипсокартон", "Drywall & paint"),
      leaf(P, "podele", "Parchet, gresie, podele", "Полы", "Flooring"),
    ]),
    section(P, "gradina-terasa", "Grădină, terasă, piscină", [
      leaf(P, "mobilier-gradina", "Mobilier grădină și terasă", "Садовая мебель", "Garden furniture"),
      leaf(P, "unelte-gradina", "Unelte și unelte motor grădină", "Садовый инвентарь", "Garden tools"),
      leaf(P, "gratar", "Grătare, fumătoare, accesorii BBQ", "Гриль", "BBQ"),
      leaf(P, "piscine", "Piscine, jacuzzi, accesorii", "Бассейны", "Pools"),
      leaf(P, "irigatii", "Sisteme irigații și furtunuri", "Орошение", "Irrigation"),
    ]),
    section(P, "decor", "Decor, textile, iluminat", [
      leaf(P, "perdele", "Perdele, draperii, rolete", "Шторы", "Curtains"),
      leaf(P, "covor", "Covoare și traversă", "Ковры", "Rugs"),
      leaf(P, "luminat", "Lămpi, lustre, LED", "Свет", "Lighting"),
      leaf(P, "tablouri-decor", "Tablouri, ceasuri de perete", "Декор", "Wall decor"),
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
      leaf(S, "soferi", "Șoferi, curse, transferuri", "Водители", "Drivers"),
    ]),
    section(S, "constructii-serv", "Construcții și finisaje", [
      leaf(S, "zugravi", "Zugrăveli", "Покраска", "Painting"),
      leaf(S, "faianta", "Faianță, gresie, mozaic", "Плитка", "Tiling"),
      leaf(S, "montaj", "Montaj mobilă și tehnică", "Сборка", "Assembly"),
      leaf(S, "electrician", "Electrician autorizat", "Электрик", "Electrician"),
      leaf(S, "instalatii", "Instalatori sanitari / încălzire", "Монтаж", "Installers"),
    ]),
    section(S, "it", "IT, web și design", [
      leaf(S, "site-uri", "Creare site-uri și magazine online", "Сайты", "Websites"),
      leaf(S, "grafica", "Design grafic și identitate", "Дизайн", "Graphic design"),
      leaf(S, "reparatii-pc", "Reparații PC / laptop / telefoane", "Ремонт ПК", "PC repair"),
      leaf(S, "retele-it", "Administrare rețele și servere", "Сети", "IT networks"),
    ]),
    section(S, "juridic", "Juridic și contabilitate", [
      leaf(S, "avocati", "Consultanță juridică", "Юристы", "Legal"),
      leaf(S, "contabilitate-serv", "Contabilitate și fiscalitate", "Бухгалтерия", "Accounting services"),
      leaf(S, "traduceri", "Traduceri autorizate", "Переводы", "Translations"),
    ]),
    section(S, "medical", "Sănătate", [
      leaf(S, "medicina", "Servicii medicale private", "Медицина", "Medical"),
      leaf(S, "stomatologie", "Stomatologie", "Стоматология", "Dental"),
    ]),
    section(S, "frumusete", "Frumusețe și îngrijire", [
      leaf(S, "coafor", "Coafor / frizer / cosmetică", "Парикмахер", "Hair & beauty"),
      leaf(S, "cosmetic", "Cosmetică și epilare", "Косметология", "Beauty"),
      leaf(S, "masaj", "Masaj și wellness", "Массаж", "Massage"),
    ]),
    section(S, "curatenie", "Curățenie și menaj", [
      leaf(S, "curatenie-loc", "Curățenie la domiciliu / birouri", "Уборка", "Cleaning"),
      leaf(S, "spalatorie-textile", "Spălătorie și curățătorie chimică", "Химчистка", "Laundry"),
    ]),
    section(S, "educatie", "Educație și cursuri", [
      leaf(S, "meditatii", "Meditații, lecții private", "Репетитор", "Tutoring"),
      leaf(S, "cursuri", "Cursuri diverse (limbi, șoferi)", "Курсы", "Courses"),
    ]),
    section(S, "evenimente", "Evenimente și media", [
      leaf(S, "foto-video", "Foto și video evenimente", "Фото/видео", "Photo/video"),
      leaf(S, "muzica", "Muzicanți, DJ, sonorizare", "Музыка", "Music"),
    ]),
  ],
};

const J = "joburi";

export const joburiRoot: CatDef = {
  slug: "joburi",
  ro: "Locuri de muncă",
  ru: "Работа",
  en: "Jobs",
  children: [
    section(J, "birou", "Birou, IT, financiar", [
      leaf(J, "administrativ", "Administrativ / secretariat", "Админ", "Admin"),
      leaf(J, "vanzari", "Vânzări și relații clienți", "Продажи", "Sales"),
      leaf(J, "it-job", "IT / software / suport tehnic", "IT", "IT"),
      leaf(J, "contabilitate", "Contabilitate", "Бухгалтерия", "Accounting"),
      leaf(J, "marketing", "Marketing și PR", "Маркетинг", "Marketing"),
    ]),
    section(J, "productie", "Producție, logistică, depozit", [
      leaf(J, "operator", "Operatori linie / mașini", "Операторы", "Operators"),
      leaf(J, "sofer-job", "Șoferi (categorii diverse)", "Водители", "Drivers"),
      leaf(J, "depozit", "Depozit, picking, stivuitor", "Склад", "Warehouse"),
      leaf(J, "livratori", "Livratori și curieri", "Курьеры", "Couriers"),
    ]),
    section(J, "servicii-job", "Servicii, retail, îngrijire", [
      leaf(J, "horeca", "HoReCa (restaurant, bar, hotel)", "HoReCa", "HoReCa"),
      leaf(J, "retail", "Retail și casierie", "Ритейл", "Retail"),
      leaf(J, "ingrijire", "Îngrijire persoane / babysitting", "Уход", "Care"),
      leaf(J, "curatenie-job", "Personal curățenie", "Уборка", "Cleaning staff"),
    ]),
    section(J, "constructii-job", "Construcții și meserii", [
      leaf(J, "zugrav-job", "Zugravi, finisaje", "Маляры", "Painters"),
      leaf(J, "electrician-job", "Electricieni", "Электрики", "Electricians"),
      leaf(J, "dulgheri", "Dulgheri, tâmplărie", "Плотники", "Carpenters"),
    ]),
    section(J, "medical-job", "Medical și educație", [
      leaf(J, "asistenti", "Asistenți medicali / infirmieri", "Медсёстры", "Medical staff"),
      leaf(J, "profesori", "Profesori și educatori", "Учителя", "Teachers"),
    ]),
  ],
};
