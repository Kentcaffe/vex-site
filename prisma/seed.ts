import { hash } from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// Import din clientul generat — evită fals pozitive TS pe `import { PrismaClient } from "@prisma/client"`.
import { PrismaClient } from "../node_modules/.prisma/client/index.js";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

function L(ro: string, ru: string, en: string) {
  return JSON.stringify({ ro, ru, en });
}

async function main() {
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "demo@vex.site",
      name: "Demo",
      passwordHash: await hash("demo12345", 12),
      role: "ADMIN",
    },
  });

  await prisma.category.create({
    data: {
      slug: "vehicule",
      sortOrder: 1,
      labels: L("Vehicule", "Транспорт", "Vehicles"),
      children: {
        create: [
          { slug: "auto", sortOrder: 1, labels: L("Autoturisme", "Легковые", "Cars") },
          { slug: "moto", sortOrder: 2, labels: L("Motociclete", "Мото", "Motorcycles") },
          { slug: "piese-auto", sortOrder: 3, labels: L("Piese auto", "Автозапчасти", "Car parts") },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      slug: "imobiliare",
      sortOrder: 2,
      labels: L("Imobiliare", "Недвижимость", "Real estate"),
      children: {
        create: [
          { slug: "apartamente", sortOrder: 1, labels: L("Apartamente", "Квартиры", "Apartments") },
          { slug: "case", sortOrder: 2, labels: L("Case", "Дома", "Houses") },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      slug: "electronice",
      sortOrder: 3,
      labels: L("Electronice", "Электроника", "Electronics"),
      children: {
        create: [
          { slug: "telefoane", sortOrder: 1, labels: L("Telefoane", "Телефоны", "Phones") },
          { slug: "laptop", sortOrder: 2, labels: L("Laptopuri", "Ноутбуки", "Laptops") },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      slug: "moda",
      sortOrder: 4,
      labels: L("Modă", "Мода", "Fashion"),
      children: {
        create: [{ slug: "haine", sortOrder: 1, labels: L("Haine", "Одежда", "Clothing") }],
      },
    },
  });

  await prisma.category.create({
    data: {
      slug: "servicii",
      sortOrder: 5,
      labels: L("Servicii", "Услуги", "Services"),
      children: {
        create: [
          { slug: "reparatii-auto", sortOrder: 1, labels: L("Reparații auto", "Авторемонт", "Car repair") },
        ],
      },
    },
  });

  const auto = await prisma.category.findFirst({ where: { slug: "auto" } });
  const demo = await prisma.user.findFirst({ where: { email: "demo@vex.site" } });
  if (auto && demo) {
    await prisma.listing.create({
      data: {
        title: "Exemplu: VW Golf 2018",
        description: "Anunț demonstrativ. Poți șterge din Prisma Studio sau din panoul admin.",
        price: 12500,
        negotiable: true,
        city: "Chișinău",
        condition: "used",
        brand: "Volkswagen",
        modelName: "Golf",
        year: 2018,
        mileageKm: 95000,
        categoryId: auto.id,
        userId: demo.id,
        images: JSON.stringify(["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"]),
      },
    });
  }

  console.log("Seed OK: categorii + utilizator demo@vex.site / demo12345 + 1 anunț exemplu.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
