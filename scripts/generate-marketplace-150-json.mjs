/**
 * Generează data/marketplace-150-realistic.json — 150 anunțuri demo MD.
 * Rulează: node scripts/generate-marketplace-150-json.mjs
 *
 * Notă tehnică: source.unsplash.com este depreciat; dacă imaginile nu se încarcă în browser,
 * înlocuiește cu imagini locale (/public/seed) sau images.unsplash.com/photo-ID.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const outPath = new URL("../data/marketplace-150-realistic.json", import.meta.url);

const LOC = ["Chișinău", "Bălți", "Cahul", "Comrat", "Orhei", "Ungheni"];

const NAMES = [
  "Ion Popescu", "Maria Rusu", "Andrei Cojocaru", "Elena Melnic", "Vasile Stratan",
  "Ana Donțu", "Cristian Burlacu", "Doina Cebotari", "Sergiu Gutu", "Ludmila Railean",
  "Nicolae Moraru", "Victoria Plămădeală", "Petru Turcan", "Gabriela Hanganu", "Maxim Ursu",
  "Stela Ciobanu", "Dumitru Negru", "Rodica Ștefănescu", "Igor Caraș", "Alina Bivol",
  "Oleg Rotari", "Natalia Lungu", "Roman Ceban", "Corina Manole", "Veaceslav Grosu",
];

function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 10000;
  return x - Math.floor(x);
}

function randInt(min, max, s) {
  return Math.min(max, Math.floor(min + rnd(s) * (max - min + 1)));
}

function isoDaysAgo(seed, maxDays) {
  const ms = Date.now() - rnd(seed) * maxDays * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

/** URL-uri conform brief (fără "featured"); sig diferă între anunțuri ca să nu fie același răspuns cache-uit identic */
const IMG = {
  Telefoane: (n, k) =>
    `https://source.unsplash.com/600x400/?smartphone,iphone&sig=${n * 10 + k}`,
  Mașini: (n, k) =>
    `https://source.unsplash.com/600x400/?car,bmw,audi,mercedes&sig=${n * 10 + k}`,
  Laptopuri: (n, k) => `https://source.unsplash.com/600x400/?laptop&sig=${n * 10 + k}`,
  Haine: (n, k) => `https://source.unsplash.com/600x400/?fashion,clothes&sig=${n * 10 + k}`,
  Electrocasnice: (n, k) =>
    `https://source.unsplash.com/600x400/?washing-machine,fridge&sig=${n * 10 + k}`,
  Mobilă: (n, k) => `https://source.unsplash.com/600x400/?sofa,furniture&sig=${n * 10 + k}`,
};

function priceRange(cat, s) {
  const r = rnd(s);
  switch (cat) {
    case "Telefoane":
      return Math.round((1000 + r * (30000 - 1000)) / 50) * 50;
    case "Mașini": {
      if (r < 0.07) return Math.round((500000 + rnd(s + 1) * (2000000 - 500000)) / 1000) * 1000;
      if (r < 0.25) return Math.round((120000 + rnd(s + 2) * (450000 - 120000)) / 500) * 500;
      return Math.round((30000 + rnd(s + 3) * (115000 - 30000)) / 100) * 100;
    }
    case "Laptopuri":
      return Math.round((2000 + r * (60000 - 2000)) / 50) * 50;
    case "Haine":
      return Math.round((100 + r * (5000 - 100)) / 10) * 10;
    case "Electrocasnice":
      return Math.round((1500 + r * (40000 - 1500)) / 50) * 50;
    case "Mobilă":
      return Math.round((500 + r * (30000 - 500)) / 50) * 50;
    default:
      return 1000;
  }
}

const BRANDS = ["BMW", "Audi", "Mercedes", "Volkswagen"];
const MODELS = {
  BMW: ["320d", "X3", "520i", "E46"],
  Audi: ["A4", "A6", "Q5"],
  Mercedes: ["C220", "E200", "ML"],
  Volkswagen: ["Golf", "Passat", "Tiguan"],
};

/** 25 × 6 = 150 — fiecare titlu unic prin indici */
const blocks = {
  Telefoane: (i, n) => {
    const bat = randInt(76, 98, n);
    const models = [
      ["iPhone 13", "128gb"],
      ["Samsung A54", "5G"],
      ["iPhone 11", "64GB"],
      ["Redmi Note 12", "128"],
      ["Pixel 7a", ""],
      ["Galaxy S21 FE", ""],
      ["iPhone SE", "2020"],
      ["Motorola g84", ""],
      ["OnePlus Nord 3", ""],
      ["iPhone 12 mini", "64"],
      ["Samsung A34", ""],
      ["Xiaomi 13T", ""],
      ["iPhone 14 Pro", "256"],
      ["Realme 11", ""],
      ["Galaxy Flip 4", ""],
      ["iPhone XR", "64"],
      ["Poco F5", ""],
      ["Samsung S23", ""],
      ["iPhone 15", "128"],
      ["Huawei nova vechi", ""],
      ["Nokia clasic", "cu taste"],
      ["Google Pixel 6", ""],
      ["Samsung A52", ""],
      ["iPhone 8", "64"],
      ["Nothing Phone 1", ""],
    ];
    const [m, extra] = models[i];
    let title = `${m}${extra ? " " + extra : ""}`.trim();
    if (rnd(n) < 0.12) title = `[URGENT] ${title}`;
    else if (rnd(n + 1) < 0.1) title = `${title} — negociabil`;
    const desc = [
      `Baterie zice ${bat}% health, tine o zi uzual.`,
      rnd(n) > 0.5 ? "Fara cutie, incarcator compatibil dau." : "Cutie + cablu, husa inclusa.",
      rnd(n + 2) < 0.15 ? "URGENT plec saptamina asta din tara." : `Vad doar ${LOC[n % 6]}, nu trimit.`,
      rnd(n + 3) < 0.25 ? "Pret negociabil serios." : "Nu schimb.",
    ];
    if (rnd(n + 4) < 0.08) desc.push("Zgarietura mica pe rama — in poza se vede.");
    return { title, description: desc.join("\n"), category: "Telefoane" };
  },
  Mașini: (i, n) => {
    const br = BRANDS[n % 4];
    const md = MODELS[br][n % MODELS[br].length];
    const yr = randInt(2000, 2023, n + i);
    const km = randInt(100000, 300000, n * 3 + i);
    const fuel = rnd(n) > 0.48 ? "diesel" : "benzină";
    let title = `${br} ${md} ${yr} — ${Math.round(km / 1000)}k km`;
    if (rnd(n) < 0.1) title = `[URGENT] ${title}`;
    if (rnd(n + 1) < 0.12) title += " negociabil";
    const desc = [
      `Motor ${fuel}, rulaj ${km.toLocaleString("ro-RO")} km.`,
      "Acte in regula, ITP valabil.",
      rnd(n) > 0.55 ? "Interior uzat pe scaun sofer, normal pt vechime." : "Culoare gri, zgarieturi parcare.",
      rnd(n + 2) < 0.35 ? "Pret negociabil la fata locului." : "Vand serios, nu pierd timpul.",
    ];
    return { title, description: desc.join("\n"), category: "Mașini" };
  },
  Laptopuri: (i, n) => {
    const items = [
      ["ThinkPad T14", "i5 16gb"],
      ["MacBook Air M1", "256gb"],
      ["HP Pavilion", "Ryzen 7"],
      ["Dell Latitude", "i7"],
      ["ASUS Vivobook", "15 inch"],
      ["Lenovo Legion", "GTX"],
      ["Surface Laptop", "13"],
      ["MacBook Pro 14", "M1 pro"],
      ["Acer Aspire", "office"],
      ["MSI thin", "gaming usor"],
      ["ThinkPad X1", "carbon"],
      ["HP EliteBook", "14"],
      ["Dell XPS 13", "fhd"],
      ["MacBook 2019", "intel"],
      ["Lenovo IdeaPad", "i3"],
      ["ASUS Zenbook", "oled"],
      ["Framework", "modular"],
      ["Samsung Galaxy Book", ""],
      ["Toshiba second", "ieftin"],
      ["Sony Vaio vechi", "piese"],
      ["Mac mini M2", "desktop"],
      ["PC all-in-one", "Lenovo"],
      ["Laptop copii", "Chromebook"],
      ["Gaming Acer", "Nitro"],
      ["Workstation Dell", "Precision"],
    ];
    const [a, b] = items[i];
    let title = `${a} ${b}`.trim();
    if (rnd(n) < 0.08) title = `${title} — urgent`;
    const desc = [
      "Folosit acasa, nu mining.",
      rnd(n) > 0.45 ? "Bateria 2-3 ore real, trebuie schimb daca vrei mult." : "Baterie ok inca.",
      rnd(n + 1) < 0.2 ? "URGENT vind ca am luat altul." : "Pot arata in centru.",
      rnd(n + 2) < 0.28 ? "Negociabil daca iei azi." : "Pret fix aproape.",
    ];
    return { title, description: desc.join("\n"), category: "Laptopuri" };
  },
  Haine: (i, n) => {
    const pieces = [
      ["Geaca", "Nike", "M"],
      ["Blugi", "Levi's", "32"],
      ["Rochie", "Zara", "38"],
      ["Adidasi", "Adidas", "42"],
      ["Palton", "Reserved", "L"],
      ["Compleu", "office", "48"],
      ["Geanta", "piele", "maro"],
      ["Hanorac", "Puma", "L"],
      ["Fusta", "H&M", "M"],
      ["Cizme", "iarna", "39"],
      ["Tricouri", "pachet 3", "L"],
      ["Costum", "gri", "50"],
      ["Geaca ski", "Decathlon", "M"],
      ["Pantaloni", "elegant", "46"],
      ["Rochie mireasa", "simpla", "40"],
      ["Umbrela", "mare", "—"],
      ["Esarfa", "mătase", "—"],
      ["Cămașă", "albă", "41"],
      ["Pulover", "wool", "M"],
      ["Ghete", "piele", "43"],
      ["Sapca", "Snapback", "—"],
      ["Trening", "copii", "128"],
      ["Rucsac", "laptop", "—"],
      ["Mănuși", "piele", "M"],
      ["Curea", "barbati", "105cm"],
    ];
    const [p, brand, sz] = pieces[i];
    let title = `${p} ${brand} — ${sz}`;
    if (rnd(n) < 0.1) title = `[URGENT] ${title}`;
    const desc = [
      rnd(n) > 0.5 ? "Purta putin, spalat corect." : "Cu mic defect la fermoar — pret mai mic.",
      "Nu schimb, doar vanzare.",
      rnd(n + 1) < 0.3 ? "Negociabil." : "Vad in rascani weekend.",
    ];
    return { title, description: desc.join("\n"), category: "Haine" };
  },
  Electrocasnice: (i, n) => {
    const items = [
      ["Frigider", "Indesit"],
      ["Masina spalat", "Bosch"],
      ["Cuptor electric", "Gorenje"],
      ["Aspirator", "Dyson vechi"],
      ["Espressor", "DeLonghi"],
      ["Robot bucatarie", "Philips"],
      ["Microunde", "Samsung"],
      ["Plita", "vitroceramica"],
      ["Hota", "incorporabila"],
      ["Uscator rufe", "Beko"],
      ["Congelator", "lada"],
      ["Aer conditionat", "split"],
      ["Fier calcat", "cu abur"],
      ["Fierbator", "sticla"],
      ["Toster", "4 felii"],
      ["Multicooker", "Redmond"],
      ["Purificator aer", "Xiaomi"],
      ["Aspirator vertical", "Rowenta"],
      ["Masina vase", "incorporabila"],
      ["Boiler", "80L"],
      ["Radiator ulei", "11 elem"],
      ["Ventilator", "turn"],
      ["Statie calcat", "vertical"],
      ["Deshidrator", "alimente"],
      ["Plita camping", "gaz"],
    ];
    const [a, b] = items[i];
    let title = `${a} ${b}`;
    if (rnd(n) < 0.12) title += " — negociabil";
    const desc = [
      "Extras la renovare / upgrade.",
      "Merge, testat inainte de ridicare.",
      rnd(n) < 0.15 ? "URGENT eliberez apartament." : "Transport nu asigur.",
    ];
    return { title, description: desc.join("\n"), category: "Electrocasnice" };
  },
  Mobilă: (i, n) => {
    const items = [
      ["Canapea colț", "gri"],
      ["Pat 160", "cu somiera"],
      ["Dulap 3 usi", "alb"],
      ["Masa extensibila", "bucatarie"],
      ["Set scaune", "6 buc"],
      ["Biblioteca", "modulara"],
      ["Comoda TV", "wenge"],
      ["Birou", "120cm"],
      ["Etajera perete", "5 rafturi"],
      ["Fotoliu", "piele eco"],
      ["Masa cafea", "sticla"],
      ["Dulap copii", "multicolor"],
      ["Paravan", "textil"],
      ["Pat supraetajat", "copii"],
      ["Masa birou", "reglabila"],
      ["Scaun ergonomic", "second"],
      ["Bufet", "vintage"],
      ["Raft pantofi", "metal"],
      ["Canapea 2 loc", "piele"],
      ["Masa picnic", "pliabila"],
      ["Saltea", "180x200"],
      ["Noptiera", "pereche"],
      ["Taburet", "rotund"],
      ["Polita", "colt"],
      ["Sifonier", "oglinda"],
    ];
    const [a, b] = items[i];
    let title = `${a} — ${b}`;
    if (rnd(n) < 0.1) title = `[URGENT] ${title}`;
    const desc = [
      "Stare uzuala, vezi pozele.",
      rnd(n) > 0.5 ? "Demontare partiala, am suruburi." : "Zgarieturi fine pe blat.",
      rnd(n + 1) < 0.25 ? "Pret negociabil la tot setul." : "Doar ridicare personala.",
    ];
    return { title, description: desc.join("\n"), category: "Mobilă" };
  },
};

const ORDER = ["Telefoane", "Mașini", "Laptopuri", "Haine", "Electrocasnice", "Mobilă"];
const listings = [];
let globalN = 0;

for (const cat of ORDER) {
  for (let i = 0; i < 25; i++) {
    const n = globalN;
    const gen = blocks[cat](i, n);
    const loc = LOC[n % LOC.length];
    const price = priceRange(gen.category === "Laptopuri" ? "Laptopuri" : gen.category, n);
    const numImg = 1 + (n % 3);
    const images = [];
    for (let k = 0; k < numImg; k++) {
      images.push(IMG[gen.category](n, k));
    }
    const user = {
      name: NAMES[n % NAMES.length],
      verified: rnd(n + 500) > 0.42,
    };
    listings.push({
      title: gen.title,
      description: gen.description,
      price,
      currency: "MDL",
      location: loc,
      category: gen.category,
      images,
      createdAt: isoDaysAgo(n + 600, 7),
      views: randInt(5, 500, n + 700),
      user,
    });
    globalN++;
  }
}

fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(listings, null, 2), "utf8");
console.log("Wrote", listings.length, "items to", outPath.pathname || outPath);
