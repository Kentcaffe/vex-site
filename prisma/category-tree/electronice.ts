import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "electronice";

export const electroniceRoot: CatDef = {
  slug: "electronice",
  ro: "Telefoane și electronice",
  ru: "Телефоны и электроника",
  en: "Phones & electronics",
  children: [
    section(P, "telefoane", "Telefoane și gadgeturi", [
      leaf(P, "smartphone", "Smartphone-uri", "Смартфоны", "Smartphones"),
      leaf(P, "telefoane-clasice", "Telefoane clasice", "Кнопочные", "Feature phones"),
      leaf(P, "tablete", "Tablete", "Планшеты", "Tablets"),
      leaf(P, "smartwatch", "Smartwatch / brățări", "Умные часы", "Wearables"),
      leaf(P, "accesorii-tel", "Huse, încărcătoare, cabluri", "Аксессуары", "Phone accessories"),
    ]),
    section(P, "pc", "Calculatoare și birotică", [
      leaf(P, "laptop", "Laptopuri", "Ноутбуки", "Laptops"),
      leaf(P, "pc-birou", "PC birou", "Настольные ПК", "Desktops"),
      leaf(P, "monitoare", "Monitoare", "Мониторы", "Monitors"),
      leaf(P, "componente", "Componente PC", "Комплектующие", "PC parts"),
      leaf(P, "periferice", "Tastaturi, mouse, periferice", "Периферия", "Peripherals"),
      leaf(P, "retea", "Rețelistică / routere", "Сеть", "Networking"),
      leaf(P, "imprimante", "Imprimante și scanere", "Принтеры", "Printers"),
    ]),
    section(P, "foto", "Foto și optică", [
      leaf(P, "aparate-foto", "Aparate foto", "Фотоаппараты", "Cameras"),
      leaf(P, "obiective", "Obiective", "Объективы", "Lenses"),
      leaf(P, "drona", "Drone", "Дроны", "Drones"),
    ]),
    section(P, "audio", "Audio portabil", [
      leaf(P, "casti", "Căști și boxe", "Наушники", "Headphones"),
      leaf(P, "playere", "Playere audio", "Плееры", "Players"),
    ]),
    section(P, "gaming", "Gaming", [
      leaf(P, "console", "Console", "Консоли", "Consoles"),
      leaf(P, "jocuri", "Jocuri", "Игры", "Games"),
    ]),
    section(P, "electrocasnice", "Electrocasnice mici și mari", [
      leaf(P, "bucatarie", "Electrocasnice bucătărie", "Кухня", "Kitchen appliances"),
      leaf(P, "ingrijire", "Îngrijire personală", "Уход", "Personal care"),
      leaf(P, "aspiratoare", "Aspiratoare", "Пылесосы", "Vacuums"),
    ]),
  ],
};
