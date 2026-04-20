import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "imobiliare";

export const imobiliareRoot: CatDef = {
  slug: "imobiliare",
  ro: "Imobiliare",
  ru: "Недвижимость",
  en: "Real estate",
  children: [
    section(P, "rezidential", "Locuințe", [
      leaf(P, "apartamente-vanzare", "Apartamente — vânzare", "Квартиры продажа", "Apartments for sale"),
      leaf(P, "apartamente-inchiriere", "Apartamente — închiriere", "Квартиры аренда", "Apartments for rent"),
      leaf(P, "garsoniere", "Garsoniere și studiouri", "Студии", "Studios"),
      leaf(P, "case-vanzare", "Case — vânzare", "Дома продажа", "Houses for sale"),
      leaf(P, "case-inchiriere", "Case — închiriere", "Дома аренда", "Houses for rent"),
      leaf(P, "camere", "Camere în apartament / shared", "Комнаты", "Rooms"),
      leaf(P, "case-tara", "Case de vacanță / la țară", "Дачи", "Country houses"),
    ]),
    section(P, "terenuri", "Terenuri", [
      leaf(P, "teren-constructii", "Terenuri pentru construcții", "Земля под застройку", "Land for building"),
      leaf(P, "teren-agricol", "Terenuri agricole", "Сельхоз земля", "Farmland"),
      leaf(P, "teren-padure", "Păduri / teren forestier", "Лес", "Forest"),
      leaf(P, "teren-comercial", "Terenuri comerciale", "Коммерческая земля", "Commercial land"),
    ]),
    section(P, "comercial", "Spații comerciale și industriale", [
      leaf(P, "birouri", "Birouri", "Офисы", "Offices"),
      leaf(P, "spatii-comerciale", "Spații comerciale / retail", "Коммерция", "Retail space"),
      leaf(P, "depozite", "Depozite și hale", "Склады", "Warehouses"),
      leaf(P, "hoteluri", "Hoteluri / pensiuni / hostel", "Отели", "Hotels"),
      leaf(P, "hale-productie", "Hale producție / ateliere", "Производство", "Industrial"),
    ]),
    section(P, "garaje", "Garaje și parcări", [
      leaf(P, "garaj", "Garaje", "Гаражи", "Garages"),
      leaf(P, "parcare", "Locuri de parcare", "Парковка", "Parking"),
    ]),
    section(P, "servicii-imob", "Servicii imobiliare", [
      leaf(P, "agentii", "Agenții imobiliare", "Агентства", "Agencies"),
      leaf(P, "evaluari", "Evaluări și expertize", "Оценка", "Appraisal"),
      leaf(P, "design-interior", "Design interior", "Дизайн", "Interior design"),
      leaf(P, "fotografie-imob", "Fotografie imobiliară / tururi virtuale", "Фото", "RE photography"),
    ]),
  ],
};
