import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Category } from "@prisma/client";
import { categoryLabel } from "@/lib/category-queries";

type Props = {
  locale: string;
  categories: Category[];
  activeSlug?: string;
};

export async function CategorySidebar({ locale, categories, activeSlug }: Props) {
  const t = await getTranslations("Browse");
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const k = c.parentId;
    const list = byParent.get(k) ?? [];
    list.push(c);
    byParent.set(k, list);
  }
  for (const [, list] of byParent) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  }

  const roots = byParent.get(null) ?? [];

  function renderNodes(parentId: string | null, depth: number): ReactNode {
    const nodes = byParent.get(parentId) ?? [];
    if (nodes.length === 0) {
      return null;
    }
    return (
      <ul className={depth === 0 ? "space-y-1" : "ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700"}>
        {nodes.map((cat) => {
          const isActive = activeSlug === cat.slug;
          const label = categoryLabel(cat.labels, locale);
          return (
            <li key={cat.id}>
              <Link
                href={`/anunturi?category=${encodeURIComponent(cat.slug)}`}
                className={`block rounded-lg px-2 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-zinc-200 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
              {renderNodes(cat.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("categories")}</h2>
      <Link
        href="/anunturi"
        className={`mb-2 block rounded-lg px-2 py-1.5 text-sm ${!activeSlug ? "bg-zinc-200 font-medium dark:bg-zinc-800" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"}`}
      >
        {t("allCategories")}
      </Link>
      {roots.length > 0 ? renderNodes(null, 0) : null}
    </aside>
  );
}
