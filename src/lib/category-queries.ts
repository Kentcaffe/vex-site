import { prisma } from "@/lib/prisma";

export type CategoryRow = {
  id: string;
  parentId: string | null;
  slug: string;
  labels: string;
  sortOrder: number;
};

type LabelJson = { ro?: string; ru?: string; en?: string };

export async function getAllCategories(): Promise<CategoryRow[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });
}

export function categoryPathLabels(all: CategoryRow[], categoryId: string, locale: string): string {
  const byId = new Map(all.map((c) => [c.id, c]));
  const chain: CategoryRow[] = [];
  let cur: CategoryRow | undefined = byId.get(categoryId);
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return chain
    .map((c) => {
      try {
        const L = JSON.parse(c.labels) as LabelJson;
        const loc = locale as keyof LabelJson;
        return L[loc] ?? L.ro ?? c.slug;
      } catch {
        return c.slug;
      }
    })
    .join(" · ");
}

export async function getDescendantCategoryIds(rootSlug: string): Promise<string[]> {
  const root = await prisma.category.findUnique({ where: { slug: rootSlug } });
  if (!root) {
    return [];
  }
  const all = await getAllCategories();
  const byParent = new Map<string | null, CategoryRow[]>();
  for (const c of all) {
    const k = c.parentId;
    if (!byParent.has(k)) {
      byParent.set(k, []);
    }
    byParent.get(k)!.push(c);
  }
  const out: string[] = [];
  const walk = (id: string) => {
    out.push(id);
    const kids = byParent.get(id) ?? [];
    for (const k of kids) {
      walk(k.id);
    }
  };
  walk(root.id);
  return out;
}

export async function getLeafCategoryOptions(locale: string): Promise<{ id: string; slug: string; path: string }[]> {
  const all = await getAllCategories();
  const idsThatAreParents = new Set<string>();
  for (const c of all) {
    if (c.parentId) {
      idsThatAreParents.add(c.parentId);
    }
  }
  const leaves = all.filter((c) => !idsThatAreParents.has(c.id));
  return leaves.map((c) => ({
    id: c.id,
    slug: c.slug,
    path: categoryPathLabels(all, c.id, locale),
  }));
}
