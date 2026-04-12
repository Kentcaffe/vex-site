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
      leaf(P, "garsoniere", "Garsoniere", "Студии", "Studios"),
      leaf(P, "case-vanzare", "Case — vânzare", "Дома продажа", "Houses for sale"),
      leaf(P, "case-inchiriere", "Case — închiriere", "Дома аренда", "Houses for rent"),
      leaf(P, "camere", "Camere în apartament", "Комнаты", "Rooms"),
    ]),
    section(P, "terenuri", "Terenuri", [
      leaf(P, "teren-constructii", "Terenuri pentru construcții", "Земля под застройку", "Land for building"),
      leaf(P, "teren-agricol", "Terenuri agricole", "Сельхоз земля", "Farmland"),
      leaf(P, "teren-padure", "Păduri / teren forestier", "Лес", "Forest"),
    ]),
    section(P, "comercial", "Comercial", [
      leaf(P, "birouri", "Birouri", "Офисы", "Offices"),
      leaf(P, "spatii-comerciale", "Spații comerciale", "Коммерция", "Retail space"),
      leaf(P, "depozite", "Depozite și hale", "Склады", "Warehouses"),
      leaf(P, "hoteluri", "Hoteluri / pensiuni", "Отели", "Hotels"),
    ]),
    section(P, "garaje", "Garaje și parcări", [
      leaf(P, "garaj", "Garaje", "Гаражи", "Garages"),
      leaf(P, "parcare", "Locuri de parcare", "Парковка", "Parking"),
    ]),
    section(P, "servicii-imob", "Servicii imobiliare", [
      leaf(P, "agentii", "Agenții imobiliare", "Агентства", "Agencies"),
      leaf(P, "evaluari", "Evaluări / expertiză", "Оценка", "Appraisal"),
      leaf(P, "design-interior", "Design interior", "Дизайн", "Interior design"),
    ]),
  ],
};
