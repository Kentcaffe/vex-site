import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { CategoryTreeNode } from "@/lib/category-tree";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ROOTS, type CatDef } from "../../prisma/category-tree";

export type CategoryRow = {
  id: string;
  parentId: string | null;
  slug: string;
  labels: string;
  sortOrder: number;
};

type LabelJson = { ro?: string; ru?: string; en?: string };

const CATEGORY_CACHE_SECONDS = 300;

function flattenCategoryDefs(defs: CatDef[], parentId: string | null): CategoryRow[] {
  const out: CategoryRow[] = [];
  for (let i = 0; i < defs.length; i += 1) {
    const def = defs[i];
    const id = `${parentId ?? "root"}:${def.slug}`;
    out.push({
      id,
      parentId,
      slug: def.slug,
      labels: JSON.stringify({
        ro: def.ro,
        ru: def.ru ?? def.ro,
        en: def.en ?? def.ro,
      }),
      sortOrder: i + 1,
    });
    if (def.children?.length) {
      out.push(...flattenCategoryDefs(def.children, id));
    }
  }
  return out;
}

const fallbackCategories: CategoryRow[] = flattenCategoryDefs(CATEGORY_ROOTS, null);

const loadAllCategoriesFromDb = unstable_cache(
  async (): Promise<CategoryRow[]> => {
    try {
      const rows = await prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
      });
      if (rows.length > 0) {
        return rows;
      }
      console.warn("[categories] Database returned 0 rows, using static fallback tree.");
      return fallbackCategories;
    } catch (error) {
      console.error("[categories] Failed to read categories from database, using static fallback tree.", error);
      return fallbackCategories;
    }
  },
  ["categories", "all"],
  { revalidate: CATEGORY_CACHE_SECONDS, tags: ["categories"] },
);

/** Categories change rarely; cached across requests + deduped within a request. */
export const getAllCategories = cache(async (): Promise<CategoryRow[]> => loadAllCategoriesFromDb());

/** Top-level categories for sidebar (e.g. homepage). */
export async function getRootCategories(): Promise<CategoryRow[]> {
  const all = await getAllCategories();
  return all
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
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

const getDescendantCategoryIdsCached = unstable_cache(
  async (rootSlug: string): Promise<string[]> => {
    const root = await prisma.category.findUnique({ where: { slug: rootSlug } });
    if (!root) {
      return [];
    }
    const all = await loadAllCategoriesFromDb();
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
  },
  ["categories", "descendants"],
  { revalidate: CATEGORY_CACHE_SECONDS, tags: ["categories"] },
);

export async function getDescendantCategoryIds(rootSlug: string): Promise<string[]> {
  return getDescendantCategoryIdsCached(rootSlug);
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

function categoryLabelFromRow(c: CategoryRow, locale: string): string {
  try {
    const L = JSON.parse(c.labels) as LabelJson;
    const loc = locale as keyof LabelJson;
    return L[loc] ?? L.ro ?? c.slug;
  } catch {
    return c.slug;
  }
}

/** Full category tree for drill-down UI (roots → … → leaves). */
export async function getCategoryTreeForPicker(locale: string): Promise<CategoryTreeNode[]> {
  const all = await getAllCategories();
  function build(parentId: string | null): CategoryTreeNode[] {
    const kids = all
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
    return kids.map((c) => {
      const sub = build(c.id);
      return {
        id: c.id,
        slug: c.slug,
        label: categoryLabelFromRow(c, locale),
        children: sub.length > 0 ? sub : null,
      };
    });
  }
  return build(null);
}
