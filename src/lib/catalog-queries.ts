import { unstable_cache } from "next/cache";
import { catalogBrand, catalogModel } from "@/lib/prisma-delegates";

export type CatalogBrandRow = { id: string; name: string };
export type CatalogModelRow = { id: string; name: string };

export async function getCatalogBrandsByCategoryId(categoryId: string): Promise<CatalogBrandRow[]> {
  if (!categoryId.trim()) {
    return [];
  }
  return unstable_cache(
    async () =>
      catalogBrand.findMany({
        where: { categoryId },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
    ["catalog-brands", categoryId],
    { revalidate: 600, tags: ["catalog"] },
  )();
}

export async function getCatalogModelsByBrandId(brandId: string): Promise<CatalogModelRow[]> {
  if (!brandId.trim()) {
    return [];
  }
  return unstable_cache(
    async () =>
      catalogModel.findMany({
        where: { brandId },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
    ["catalog-models", brandId],
    { revalidate: 600, tags: ["catalog"] },
  )();
}

export async function categoryHasCatalogBrands(categoryId: string): Promise<boolean> {
  if (!categoryId.trim()) return false;
  const n = await catalogBrand.count({ where: { categoryId } });
  return n > 0;
}
