import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "electronice";

export const electroniceRoot: CatDef = {
  slug: "electronice",
  ro: "Electronice & IT",
  ru: "Электроника и IT",
  en: "Electronics & IT",
  children: [
    section(P, "telefoane", "Telefoane și gadgeturi", [
      leaf(P, "smartphone", "Smartphone-uri", "Смартфоны", "Smartphones"),
      leaf(P, "telefoane-clasice", "Telefoane clasice", "Кнопочные", "Feature phones"),
      leaf(P, "tablete", "Tablete", "Планшеты", "Tablets"),
      leaf(P, "smartwatch", "Smartwatch / brățări fitness", "Умные часы", "Wearables"),
      leaf(P, "ebook", "E-book reader", "Электронные книги", "E-readers"),
      leaf(P, "accesorii-tel", "Huse, încărcătoare, cabluri", "Аксессуары", "Phone accessories"),
    ]),
    section(P, "pc", "Calculatoare, laptopuri și servere", [
      leaf(P, "laptop", "Laptopuri", "Ноутбуки", "Laptops"),
      leaf(P, "pc-birou", "PC birou", "Настольные ПК", "Desktops"),
      leaf(P, "servere", "Servere și rack-uri", "Серверы", "Servers"),
      leaf(P, "monitoare", "Monitoare", "Мониторы", "Monitors"),
      leaf(P, "componente", "Componente PC", "Комплектующие", "PC parts"),
      leaf(P, "periferice", "Tastaturi, mouse, periferice", "Периферия", "Peripherals"),
      leaf(P, "retea", "Routere, switch-uri, rețea", "Сеть", "Networking"),
      leaf(P, "nas", "NAS și stocare rețea", "NAS", "NAS storage"),
      leaf(P, "imprimante", "Imprimante, scanere, multifuncționale", "Принтеры", "Printers"),
    ]),
    section(P, "foto", "Foto, video și optică", [
      leaf(P, "aparate-foto", "Aparate foto DSLR / mirrorless", "Фотоаппараты", "Cameras"),
      leaf(P, "obiective", "Obiective", "Объективы", "Lenses"),
      leaf(P, "drona", "Drone și accesorii", "Дроны", "Drones"),
      leaf(P, "camere-video", "Camere video / GoPro", "Видеокамеры", "Video cameras"),
      leaf(P, "binocluri", "Binocluri și lunete", "Бинокли", "Optics"),
    ]),
    section(P, "audio", "Audio și multimedia", [
      leaf(P, "casti", "Căști, căști gaming, boxe", "Наушники", "Headphones"),
      leaf(P, "playere", "Playere portabile, MP3", "Плееры", "Players"),
      leaf(P, "soundbar", "Soundbar și home cinema", "Саундбары", "Soundbars"),
      leaf(P, "microfoane", "Microfoane și interfoane", "Микрофоны", "Microphones"),
    ]),
    section(P, "tv", "TV și streaming", [
      leaf(P, "televizoare", "Televizoare", "Телевизоры", "TVs"),
      leaf(P, "media-players", "Media players, Android TV", "Приставки", "Media players"),
      leaf(P, "proiectoare", "Proiectoare", "Проекторы", "Projectors"),
    ]),
    section(P, "gaming", "Gaming", [
      leaf(P, "console", "Console", "Консоли", "Consoles"),
      leaf(P, "jocuri", "Jocuri fizice și accesorii", "Игры", "Games"),
      leaf(P, "scaun-gaming", "Scaune gaming", "Кресла", "Gaming chairs"),
    ]),
    section(P, "smart-home", "Casă inteligentă și securitate", [
      leaf(P, "smart-becuri", "Becuri și prize inteligente", "Умный дом", "Smart lighting"),
      leaf(P, "camere-ip", "Camere IP și interfoane video", "IP-камеры", "IP cameras"),
      leaf(P, "alarme", "Sisteme alarmă și senzori", "Сигнализации", "Alarms"),
      leaf(P, "roboti", "Aspiratoare robot, roboți menaj", "Роботы", "Robots"),
    ]),
    section(P, "electrocasnice", "Electrocasnice mici și mari", [
      leaf(P, "bucatarie", "Electrocasnice bucătărie", "Кухня", "Kitchen appliances"),
      leaf(P, "ingrijire", "Îngrijire personală", "Уход", "Personal care"),
      leaf(P, "aspiratoare", "Aspiratoare", "Пылесосы", "Vacuums"),
      leaf(P, "climatizare", "Aer condiționat, ventilatoare, umidificatoare", "Климат", "Climate"),
    ]),
    section(P, "software", "Software și licențe", [
      leaf(P, "licente", "Licențe Windows, Office, antivirus", "Лицензии", "Licenses"),
      leaf(P, "servicii-it", "Servicii instalare / configurare", "IT-услуги", "IT setup"),
    ]),
  ],
};
