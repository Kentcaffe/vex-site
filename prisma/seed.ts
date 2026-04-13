import { hash } from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { CATEGORY_ROOTS, type CatDef } from "./category-tree/index.js";
import { PrismaClient } from "../node_modules/.prisma/client/index.js";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

function L(ro: string, ru: string, en: string) {
  return JSON.stringify({ ro, ru, en });
}

async function seedTree(defs: CatDef[], parentId: string | null) {
  let order = 0;
  for (const def of defs) {
    order += 1;
    const created = await prisma.category.create({
      data: {
        slug: def.slug,
        parentId,
        sortOrder: order,
        labels: L(def.ro, def.ru ?? def.ro, def.en ?? def.ro),
      },
    });
    if (def.children?.length) {
      await seedTree(def.children, created.id);
    }
  }
}

async function main() {
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  /** Nu ștergem toți utilizatorii — conturile înregistrate prin site trebuie să rămână permanente.
   *  Asigurăm doar utilizatorul demo (upsert). */
  await prisma.user.upsert({
    where: { email: "demo@vex.site" },
    create: {
      email: "demo@vex.site",
      name: "Demo",
      passwordHash: await hash("demo12345", 12),
      role: "ADMIN",
    },
    update: {
      name: "Demo",
      role: "ADMIN",
    },
  });

  await seedTree(CATEGORY_ROOTS, null);

  const leafAuto = await prisma.category.findFirst({ where: { slug: "transport-autoturisme" } });
  const demo = await prisma.user.findFirst({ where: { email: "demo@vex.site" } });
  if (leafAuto && demo) {
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
        categoryId: leafAuto.id,
        userId: demo.id,
        images: JSON.stringify(["/seed/cover-0.jpg"]),
      },
    });
  }

  const count = await prisma.category.count();
  console.log(`Seed OK: ${count} categorii + utilizator demo@vex.site / demo12345 + anunț exemplu.`);
  console.log(`Pentru 150 anunțuri demo (marketplace MD): npm run seed:marketplace`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
