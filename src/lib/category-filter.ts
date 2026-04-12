import { prisma } from "@/lib/prisma";
import { getDescendantCategoryIds } from "@/lib/category-queries";

/** Returns category ids to filter listings, or null if slug is unknown. */
export async function getListingCategoryFilterIds(slug: string | undefined): Promise<string[] | null> {
  if (!slug?.trim()) {
    return null;
  }
  const cat = await prisma.category.findUnique({
    where: { slug: slug.trim() },
    select: { id: true },
  });
  if (!cat) {
    return null;
  }
  const childCount = await prisma.category.count({ where: { parentId: cat.id } });
  if (childCount > 0) {
    return getDescendantCategoryIds(slug.trim());
  }
  return [cat.id];
}
