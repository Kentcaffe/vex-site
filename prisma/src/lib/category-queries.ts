import type { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AppLocale = "ro" | "ru" | "en";

export function parseLabels(json: string): Record<string, string> {
  try {
    const v = JSON.parse(json) as Record<string, string>;
    return typeof v === "object" && v !== null ? v : {};
  } catch {
    return {};
  }
}

export function categoryLabel(labelsJson: string, locale: string): string {
  const labels = parseLabels(labelsJson);
  return labels[locale] ?? labels.ro ?? labels.en ?? labels.ru ?? "—";
}

/** Categorii „frunză” (fără copii) — pentru publicare anunț */
export async function getLeafCategories(): Promise<Category[]> {
  const all = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { slug: "asc" }] });
  const parentIds = new Set<string>();
  for (const c of all) {
    if (c.parentId) {
      parentIds.add(c.parentId);
    }
  }
  return all.filter((c) => !parentIds.has(c.id));
}

export async function getAllCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { slug: "asc" }] });
}

/** Drum categorie: „Auto › Piese › Anvelope” */
export function categoryPathLabels(
  categories: Category[],
  leafId: string,
  locale: string,
): string {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  let cur: Category | undefined = byId.get(leafId);
  while (cur) {
    parts.unshift(categoryLabel(cur.labels, locale));
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(" › ");
}

/** Pentru filtru: toate id-urile din subarbore (inclusiv rădăcina). Gol dacă slug inexistent. */
export async function getDescendantCategoryIds(rootSlug: string): Promise<string[]> {
  const root = await prisma.category.findUnique({ where: { slug: rootSlug } });
  if (!root) {
    return [];
  }
  const all = await prisma.category.findMany();
  const childrenMap = new Map<string, string[]>();
  for (const c of all) {
    if (!c.parentId) {
      continue;
    }
    const list = childrenMap.get(c.parentId) ?? [];
    list.push(c.id);
    childrenMap.set(c.parentId, list);
  }
  const out: string[] = [root.id];
  const stack = [...(childrenMap.get(root.id) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    out.push(id);
    const ch = childrenMap.get(id);
    if (ch) {
      stack.push(...ch);
    }
  }
  return out;
}


/** Copii direcți (meniu lateral nivel cu nivel) */
export async function getRootCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { parentId },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });
}
