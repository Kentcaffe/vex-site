/**
 * Seed marketplace VEX (Moldova) — 150 anunțuri + utilizatori realiști.
 * Rulare: node seed.js
 *
 * Cerințe: schema aplicată pe Postgres (npm run db:migrate sau db:push)
 * Categorii: rulează mai întâi  npx tsx prisma/seed.ts  (sau build care creează copacul de categorii).
 * Dacă Prisma e indisponibilă, scrie ads.json în rădăcina proiectului.
 */

require("dotenv/config");
const fs = require("fs");
const path = require("path");

let PrismaClient;
try {
  PrismaClient = require("@prisma/client").PrismaClient;
  require("@prisma/adapter-pg");
  require("pg");
} catch {
  PrismaClient = null;
}

const { hashSync } = require("bcryptjs");

const DB_URL = process.env.DATABASE_URL;
const ADS_JSON = path.join(__dirname, "ads.json");

const LOCATIONS = ["Chișinău", "Bălți", "Cahul", "Comrat", "Orhei", "Ungheni"];

/** Slug-uri reale din prisma/category-tree (frunze) — rotație pentru varietate */
const SLUG_BY_GROUP = {
  Telefoane: ["electronice-smartphone", "electronice-tablete", "electronice-telefoane-clasice", "electronice-smartwatch"],
  Mașini: ["transport-autoturisme"],
  Electronice: ["electronice-laptop", "electronice-monitoare", "electronice-console", "electronice-casti", "electronice-pc-birou"],
  Haine: ["moda-barbati-haine", "moda-femei-haine", "moda-barbati-incalt", "moda-femei-incalt", "moda-copii-haine"],
  Electrocasnice: ["electronice-bucatarie", "electronice-aspiratoare", "electronice-ingrijire"],
  Mobilă: ["casa-canapele", "casa-dormitor", "casa-bucatarie-mob", "casa-birou-mob", "casa-depozitare"],
};

const CAR_BRANDS = ["BMW", "Audi", "Mercedes", "Volkswagen"];
const CAR_MODELS = {
  BMW: ["320d", "520i", "X5", "E90", "F30", "Seria 3"],
  Audi: ["A4", "A6", "Q5", "A3", "B8"],
  Mercedes: ["C200", "E220", "ML 320", "W204", "Sprinter"],
  Volkswagen: ["Golf", "Passat", "Tiguan", "Touran", "Polo"],
};

function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 10000;
  return x - Math.floor(x);
}

function randInt(min, max, seed) {
  const r = rnd((seed ?? Math.random()) * 99991 + min + max);
  return Math.min(max, Math.floor(min + r * (max - min + 1)));
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function randomCreatedLast7Days(seed) {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const t = now - rnd(seed + 1) * week;
  return new Date(t);
}

function memberSinceDate(year) {
  const m = randInt(0, 11, year * 3);
  const d = randInt(1, 28, year * 7);
  return new Date(year, m, d);
}

/**
 * Imagini locale din /public/seed — același domeniu cu site-ul, fără CDN blocat de rețea / extensii.
 * (Generare: vezi comentariu README sau rulează scriptul din repo care descarcă JPEG-uri în public/seed.)
 */
const LOCAL_COVERS = [
  "/seed/cover-0.jpg",
  "/seed/cover-1.jpg",
  "/seed/cover-2.jpg",
  "/seed/cover-3.jpg",
  "/seed/cover-4.jpg",
  "/seed/cover-5.jpg",
];

function imagesForGroup(_group, i) {
  const n = 1 + (i % 3);
  const urls = [];
  for (let k = 0; k < n; k++) {
    urls.push(LOCAL_COVERS[(i * 3 + k) % LOCAL_COVERS.length]);
  }
  return urls;
}

const FIRST_NAMES = [
  "Ion", "Maria", "Andrei", "Elena", "Vasile", "Ana", "Cristian", "Doina", "Sergiu", "Ludmila",
  "Nicolae", "Victoria", "Petru", "Gabriela", "Maxim", "Stela", "Dumitru", "Rodica", "Igor", "Alina",
  "Oleg", "Natalia", "Roman", "Corina", "Veaceslav", "Lilia", "Pavel", "Ecaterina", "Alexandru", "Veronica",
];

const LAST_NAMES = [
  "Popescu", "Russo", "Cojocaru", "Turcan", "Moraru", "Ciobanu", "Gutu", "Melnic", "Cebotari", "Ursu",
  "Plămădeală", "Stratan", "Hanganu", "Burlacu", "Donțu", "Railean", "Ștefănescu", "Negru", "Bivol", "Caraș",
];

function generateUsers(count) {
  const used = new Set();
  const users = [];
  const passHash = hashSync("VexSeed2024!", 10);
  for (let i = 0; i < count; i++) {
    let fn = pick(FIRST_NAMES, i * 7);
    let ln = pick(LAST_NAMES, i * 11);
    let email = `${fn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${ln.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${i}@seed.vex.md`;
    if (used.has(email)) email = `vanzator${i}@seed.vex.md`;
    used.add(email);
    const memberSinceYear = randInt(2018, 2025, i * 13);
    const verified = rnd(i + 99) > 0.45;
    const createdAt = memberSinceDate(memberSinceYear);
    users.push({
      email,
      name: `${fn} ${ln}`,
      passwordHash: passHash,
      city: pick(LOCATIONS, i + 3),
      phone: `+3736${String(randInt(1000000, 9999999, i)).slice(0, 7)}`,
      preferences: {
        seedVerified: verified,
        memberSinceYear,
      },
      createdAt,
      _display: { verified, memberSince: memberSinceYear },
    });
  }
  return users;
}

function priceForGroup(group, seed) {
  const s = seed * 17;
  switch (group) {
    case "Telefoane":
      return Math.round((1000 + rnd(s) * (30000 - 1000)) / 50) * 50;
    case "Mașini": {
      const r = rnd(s);
      let p;
      if (r < 0.06) p = 500000 + rnd(s + 1) * (2000000 - 500000);
      else if (r < 0.22) p = 150000 + rnd(s + 2) * (500000 - 150000);
      else p = 30000 + rnd(s + 3) * (150000 - 30000);
      return Math.round(p / 100) * 100;
    }
    case "Electronice":
      return Math.round((2000 + rnd(s) * (60000 - 2000)) / 50) * 50;
    case "Haine":
      return Math.round((100 + rnd(s) * (5000 - 100)) / 10) * 10;
    case "Electrocasnice":
      return Math.round((1500 + rnd(s) * (40000 - 1500)) / 50) * 50;
    case "Mobilă":
      return Math.round((500 + rnd(s) * (30000 - 500)) / 50) * 50;
    default:
      return 1000;
  }
}

/** 150 de titluri + descrieri unice (variabile), fără copy-paste masiv */
function buildListingDrafts() {
  const groups = ["Telefoane", "Mașini", "Electronice", "Haine", "Electrocasnice", "Mobilă"];
  const drafts = [];
  let n = 0;

  for (const group of groups) {
    for (let k = 0; k < 25; k++) {
      const seed = n * 31 + k * 7;
      const loc = pick(LOCATIONS, n + k * 2);
      const price = priceForGroup(group, seed);
      let title;
      let description;
      let brand = null;
      let modelName = null;
      let year = null;
      let mileageKm = null;

      if (group === "Mașini") {
        brand = pick(CAR_BRANDS, seed);
        modelName = pick(CAR_MODELS[brand], seed + 1);
        year = randInt(2000, 2023, seed + 2);
        mileageKm = randInt(100000, 300000, seed + 3);
        const fuel = rnd(seed) > 0.52 ? "diesel" : "benzină";
        const quirks = [
          `Rulaj ${mileageKm.toLocaleString("ro-RO")} km, consum rezonabil.`,
          `ITP și RCA valabile; acte în regulă.`,
          `Interior uzat ușor pe scaun șofer; la exterior zgârieturi parcare.`,
          `Motor ${fuel}; schimburi la timp, facturi păstrate parțial.`,
          `Negociez serios doar la fața locului.`,
        ];
        const urgent = rnd(seed + 4) < 0.12 ? "\nURGENT — plec din țară, predare rapidă." : "";
        const neg = rnd(seed + 5) < 0.35 ? "\nPreț negociabil în limita bunului simț." : "";
        title = `${brand} ${modelName} ${year} — ${Math.round(mileageKm / 1000)}k km`;
        if (rnd(seed + 6) < 0.08) title = `[URGENT] ${title}`;
        if (rnd(seed + 7) < 0.1) title += " — negociabil";
        description = `${quirks.slice(0, 2).join("\n")}\n${pick(quirks, seed)}${urgent}${neg}`;
      } else if (group === "Telefoane") {
        const models = [
          ["Samsung", "Galaxy A54"],
          ["Apple", "iPhone 12"],
          ["Xiaomi", "Redmi Note 12"],
          ["Google", "Pixel 6a"],
          ["OnePlus", "Nord 3"],
          ["Motorola", "Edge 30"],
        ];
        [brand, modelName] = pick(models, seed);
        title = `${modelName} — ${randInt(64, 256, seed)} GB`;
        description = `Baterie ~${randInt(78, 99, seed)}% health zice aplicația.\n${rnd(seed) > 0.5 ? "Fără cutie; încărcător compatibil dau." : "Cutie + cablu, folie pusă pe ecran."}\n${rnd(seed + 1) < 0.15 ? "URGENT — schimb telefonul săptămâna asta." : `Întâlnire ${loc}, nu trimit poștă.`}`;
        if (rnd(seed + 2) < 0.25) description += "\nPreț negociabil.";
        if (rnd(seed + 3) < 0.12) description += "\nMică zgârietură pe ramă — în poze se vede.";
      } else if (group === "Electronice") {
        const items = [
          ["Laptop", "Lenovo ThinkPad T14"],
          ["Monitor", "Dell 27\""],
          ["PC", "Ryzen + RTX (fără SSD)"],
          ["Consolă", "PS4 Pro"],
          ["Căști", "Sony WH-1000XM4"],
        ];
        [brand, modelName] = pick(items, seed);
        title = `${modelName} — second hand`;
        description = `Folosit acasă, nu mining.\n${rnd(seed) > 0.55 ? "Ambalaj original nu mai am." : "Cutie parțial, accesorii mixte."}\n${rnd(seed + 1) < 0.2 ? "URGENT vind pentru upgrade." : "Pot arăta funcționând."}`;
        if (rnd(seed + 2) < 0.3) description += "\nNegociabil dacă luați azi.";
      } else if (group === "Haine") {
        brand = pick(["Zara", "Reserved", "Nike", "LC Waikiki", "H&M"], seed);
        title = `${pick(["Geacă", "Pantaloni", "Rochie", "Adidași", "Compleu"], seed)} ${brand} — mărimea ${pick(["S", "M", "L", "42", "44"], seed)}`;
        description = `Purtați puțin / sau cu defect minor menționat.\n${rnd(seed) > 0.5 ? "Spălat corect, fără pete mari." : "O pete mică pe mânecă — vedeți pozele."}\n${rnd(seed + 1) < 0.25 ? "Preț negociabil." : "Nu schimb."}`;
        if (rnd(seed + 2) < 0.1) description += "\nUrgent eliberez dulapul.";
      } else if (group === "Electrocasnice") {
        title = `${pick(["Frigider", "Mașină de spălat", "Cuptor electric", "Aspirator vertical", "Espressor"], seed)} — ${pick(["Bosch", "Samsung", "Whirlpool", "Philips"], seed)}`;
        description = `Extras la renovare / sau schimb electrocasnic mai mare.\nMerge, testat înainte de predare.\n${rnd(seed) < 0.18 ? "Transport nu asigur." : "Pot ajuta la încărcat în mașină."}`;
        if (rnd(seed + 1) < 0.28) description += "\nNegociabil.";
        if (rnd(seed + 2) < 0.08) description += "\nURGENT — mutare apartament.";
      } else {
        title = `${pick(["Canapea", "Dulap", "Pat", "Masă", "Scaun birou"], seed)} — ${pick(["stejar", "gri", "alb", "wenge"], seed)}`;
        description = `Mobilă din ${pick(["apartament", "cameră copii", "bucătărie"], seed)}, stare uzuală pentru vechime.\n${rnd(seed) > 0.45 ? "Demontare parțială — am șuruburi într-o pungă." : "Zgârieturi fine pe blat — normale."}\n${rnd(seed + 1) < 0.22 ? "Preț negociabil la set complet." : "Vând doar tot setul."}`;
      }

      const views = randInt(5, 500, seed + 400);
      const slug = pick(SLUG_BY_GROUP[group], n + k);
      drafts.push({
        group,
        slug,
        title,
        description: description.replace(/\n{3,}/g, "\n\n").trim(),
        price,
        city: loc,
        views,
        images: imagesForGroup(group, n),
        brand,
        modelName,
        year,
        mileageKm,
        negotiable: /negociabil/i.test(title + description),
        createdAt: randomCreatedLast7Days(seed + 800),
      });
      n++;
    }
  }
  return drafts;
}

async function runPrisma() {
  if (!DB_URL) {
    throw new Error("DATABASE_URL lipsește. Setează connection string-ul PostgreSQL în .env.");
  }
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: DB_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
  const slugList = [...new Set(Object.values(SLUG_BY_GROUP).flat())];
  const categories = await prisma.category.findMany({ where: { slug: { in: slugList } } });
  const slugToId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const missing = slugList.filter((s) => !slugToId[s]);
  if (missing.length) {
    throw new Error(
      `Lipsesc categorii în DB: ${missing.join(", ")}. Rulează: npx tsx prisma/seed.ts`,
    );
  }

  const seedUsers = generateUsers(42);
  const drafts = buildListingDrafts();

  await prisma.$transaction(async (tx) => {
    await tx.chatMessage.deleteMany();
    await tx.chatReadState.deleteMany();
    await tx.chatRoom.deleteMany();
    await tx.listingReport.deleteMany();
    await tx.listingFavorite.deleteMany();
    await tx.userNotification.deleteMany();
    await tx.otherContentReport.deleteMany();
    await tx.passwordResetToken.deleteMany();
    await tx.listing.deleteMany();
    await tx.user.deleteMany({
      where: { email: { contains: "@seed.vex.md" } },
    });

    const createdUsers = [];
    for (const u of seedUsers) {
      const { _display, ...data } = u;
      const created = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
          city: data.city,
          phone: data.phone,
          preferences: data.preferences,
          createdAt: data.createdAt,
          role: "USER",
        },
      });
      createdUsers.push({ ...created, _display });
    }

    const listingsPayload = drafts.map((d, i) => {
      const u = createdUsers[i % createdUsers.length];
      const detailsObj = {
        currency: "MDL",
        views: d.views,
        seedCategoryLabel: d.group,
      };
      return {
        title: d.title,
        description: d.description,
        price: d.price,
        negotiable: d.negotiable,
        city: d.city,
        district: null,
        phone: u.phone,
        condition: "used",
        brand: d.brand,
        modelName: d.modelName,
        year: d.year,
        mileageKm: d.mileageKm,
        detailsJson: JSON.stringify(detailsObj),
        images: JSON.stringify(d.images),
        categoryId: slugToId[d.slug],
        userId: u.id,
        createdAt: d.createdAt,
      };
    });

    await tx.listing.createMany({ data: listingsPayload });
  });

  const total = await prisma.listing.count();
  return { ok: true, users: seedUsers.length, listings: drafts.length, totalListings: total };
  } finally {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
  }
}

function runJsonExportOnly() {
  const seedUsers = generateUsers(42);
  const drafts = buildListingDrafts();
  const out = drafts.map((d, i) => {
    const u = seedUsers[i % seedUsers.length];
    return {
      title: d.title,
      description: d.description,
      price: d.price,
      currency: "MDL",
      location: d.city,
      category: d.group,
      images: d.images,
      createdAt: d.createdAt.toISOString(),
      views: d.views,
      user: {
        name: u.name,
        verified: u._display.verified,
        memberSince: u._display.memberSince,
      },
    };
  });
  fs.writeFileSync(ADS_JSON, JSON.stringify(out, null, 2), "utf8");
  return { ok: true, path: ADS_JSON, count: out.length };
}

async function main() {
  console.log("VEX marketplace seed — Moldova");

  if (!PrismaClient) {
    console.warn("@prisma/client indisponibil — scriu ads.json");
    const r = runJsonExportOnly();
    console.log(`OK: ${r.count} anunțuri → ${r.path}`);
    return;
  }

  try {
    const r = await runPrisma();
    console.log(`OK Prisma: ${r.listings} anunțuri, ${r.users} utilizatori seed (@seed.vex.md).`);
    console.log(`Total anunțuri în DB: ${r.totalListings}`);
  } catch (e) {
    console.error("Prisma:", e.message || e);
    const r = runJsonExportOnly();
    console.log(`Fallback: ${r.count} anunțuri → ${r.path}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
