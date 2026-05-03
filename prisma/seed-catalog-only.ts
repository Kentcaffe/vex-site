/**
 * Populează doar `catalog_brands` / `catalog_models` (fără ștergere anunțuri/categorii).
 * Folosește pe Render/Supabase după migrări, când nu vrei `prisma/seed.ts` complet.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedMarketplaceCatalog } from "./catalog-seed/run";

async function main() {
  await seedMarketplaceCatalog();
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
