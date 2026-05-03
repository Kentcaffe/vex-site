import { prisma } from "../../src/lib/prisma";
import { catalogBrand, catalogModel } from "../../src/lib/prisma-delegates";
import { MARKETPLACE_CATALOG_PACKS } from "./data";

/**
 * Populează catalog_brands / catalog_models pentru categoriile definite în `data.ts`.
 * Idempotent: șterge catalogul existent și reîncarcă (seed dev).
 */
export async function seedMarketplaceCatalog(): Promise<void> {
  await catalogModel.deleteMany();
  await catalogBrand.deleteMany();

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(categories.map((c) => [c.slug, c.id]));

  for (const pack of MARKETPLACE_CATALOG_PACKS) {
    const categoryId = slugToId.get(pack.categorySlug);
    if (!categoryId) {
      console.warn(`[catalog-seed] Categoria lipsește (slug): ${pack.categorySlug}`);
      continue;
    }
    let bo = 0;
    for (const b of pack.brands) {
      bo += 1;
      const brand = await catalogBrand.create({
        data: {
          categoryId,
          name: b.name,
          sortOrder: bo,
        },
      });
      const models = [...b.models];
      if (models.length === 0) continue;
      await catalogModel.createMany({
        data: models.map((name, i) => ({
          brandId: brand.id,
          name,
          sortOrder: i + 1,
        })),
      });
    }
  }

  const bc = await catalogBrand.count();
  const mc = await catalogModel.count();
  console.log(`[catalog-seed] OK: ${bc} mărci, ${mc} modele în catalog.`);
}
