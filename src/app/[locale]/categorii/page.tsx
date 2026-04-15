import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizedHref } from "@/lib/paths";
import { CATEGORY_ROOTS, type CatDef } from "../../../../prisma/category-tree";

type Props = {
  params: Promise<{ locale: string }>;
};

type Labels = { ro?: string; ru?: string; en?: string };
type CategoryRow = {
  id: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  labels: string;
};

function flattenDefs(defs: CatDef[], parentId: string | null, level = 0): CategoryRow[] {
  const out: CategoryRow[] = [];
  for (let i = 0; i < defs.length; i += 1) {
    const def = defs[i];
    const id = `${parentId ?? "root"}:${def.slug}`;
    out.push({
      id,
      slug: def.slug,
      parentId,
      sortOrder: i + 1 + level * 1000,
      labels: JSON.stringify({
        ro: def.ro,
        ru: def.ru ?? def.ro,
        en: def.en ?? def.ro,
      }),
    });
    if (def.children?.length) {
      out.push(...flattenDefs(def.children, id, level + 1));
    }
  }
  return out;
}

function labelForLocale(labels: string, locale: string, fallback: string): string {
  try {
    const parsed = JSON.parse(labels) as Labels;
    if (locale === "ru") return parsed.ru ?? parsed.ro ?? parsed.en ?? fallback;
    if (locale === "en") return parsed.en ?? parsed.ro ?? parsed.ru ?? fallback;
    return parsed.ro ?? parsed.ru ?? parsed.en ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function CategoriiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let categories: CategoryRow[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
    });
  } catch (error) {
    console.error("[categorii] Failed to load categories from DB. Using static fallback.", error);
  }

  const usingFallback = categories.length === 0;
  if (usingFallback) {
    categories = flattenDefs(CATEGORY_ROOTS, null);
  }

  const listingsHref = localizedHref(locale, "/anunturi");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Categorii</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Total categorii: <span className="font-semibold">{categories.length}</span>
      </p>
      {usingFallback ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Categoriile sunt afișate din fallback static. Rulează manual pe server: <code>npm run db:seed</code>.
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3">Nume</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">{labelForLocale(category.labels, locale, category.slug)}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{category.slug}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-600">{category.parentId ?? "-"}</td>
                <td className="px-4 py-3">{category.sortOrder}</td>
                <td className="px-4 py-3">
                  <a
                    className="text-blue-700 hover:underline"
                    href={`${listingsHref}?category=${encodeURIComponent(category.slug)}`}
                  >
                    Vezi anunturi
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
