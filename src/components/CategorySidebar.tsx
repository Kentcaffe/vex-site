import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { emojiForRootSlug } from "@/lib/category-icons";
import { getSubcategoryLucideIcon } from "@/lib/category-subcategory-icons";
import type { CategoryRow } from "@/lib/category-queries";

type Props = {
  locale: string;
  all: CategoryRow[];
  currentCategory?: string;
};

type LabelJson = { ro?: string; ru?: string; en?: string };

function labelFor(cat: CategoryRow, locale: string): string {
  try {
    const L = JSON.parse(cat.labels) as LabelJson;
    const loc = locale as keyof LabelJson;
    return L[loc] ?? L.ro ?? cat.slug;
  } catch {
    return cat.slug;
  }
}

function buildChildrenByParent(rows: CategoryRow[]): Map<string | null, CategoryRow[]> {
  const map = new Map<string | null, CategoryRow[]>();
  for (const c of rows) {
    const k = c.parentId;
    if (!map.has(k)) {
      map.set(k, []);
    }
    map.get(k)!.push(c);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  }
  return map;
}

function isActiveSlug(current: string | undefined, slug: string): boolean {
  return current === slug;
}

function isActiveUnder(all: CategoryRow[], currentSlug: string | undefined, node: CategoryRow): boolean {
  if (!currentSlug) {
    return false;
  }
  let cur: CategoryRow | undefined = all.find((x) => x.slug === currentSlug);
  while (cur) {
    if (cur.id === node.id) {
      return true;
    }
    const pid = cur.parentId;
    cur = pid ? all.find((x) => x.id === pid) : undefined;
  }
  return false;
}

function SubTree({
  locale,
  all,
  byParent,
  parentId,
  currentCategory,
  depth,
}: {
  locale: string;
  all: CategoryRow[];
  byParent: Map<string | null, CategoryRow[]>;
  parentId: string;
  currentCategory?: string;
  depth: number;
}) {
  const kids = byParent.get(parentId) ?? [];
  if (kids.length === 0) {
    return null;
  }

  return (
    <ul
      className={`space-y-1 ${
        depth === 0
          ? "mt-2 border-l-2 border-emerald-200/80 pl-3 dark:border-emerald-800/60"
          : depth === 1
            ? "ml-1 border-l border-zinc-200 pl-3 dark:border-zinc-700"
            : "ml-1 border-l border-zinc-100 pl-3 dark:border-zinc-800"
      }`}
    >
      {kids.map((node) => {
        const active = isActiveSlug(currentCategory, node.slug);
        const hasKids = (byParent.get(node.id)?.length ?? 0) > 0;
        const IconGlyph = depth <= 2 ? getSubcategoryLucideIcon(node.slug) : null;
        const childTree = (
          <SubTree
            locale={locale}
            all={all}
            byParent={byParent}
            parentId={node.id}
            currentCategory={currentCategory}
            depth={depth + 1}
          />
        );
        return (
          <li key={node.id}>
            <div className="flex items-start gap-1.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-zinc-500" aria-hidden>
                {IconGlyph ? <IconGlyph className="h-3.5 w-3.5" strokeWidth={1.75} /> : <span className="text-[10px] text-zinc-400">·</span>}
              </span>
              <Link
                href={`/anunturi?category=${encodeURIComponent(node.slug)}`}
                className={`block min-w-0 flex-1 leading-snug ${
                  hasKids && depth <= 1
                    ? "text-[13px] font-semibold text-zinc-800 dark:text-zinc-100"
                    : "text-[13px] font-normal"
                } ${
                  active
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
                }`}
              >
                {labelFor(node, locale)}
              </Link>
            </div>
            {childTree}
          </li>
        );
      })}
    </ul>
  );
}

export async function CategorySidebar({ locale, all, currentCategory }: Props) {
  const t = await getTranslations("Listings");
  const byParent = buildChildrenByParent(all);
  const roots = byParent.get(null) ?? [];

  const linkClass = (active: boolean) =>
    active
      ? "font-semibold text-emerald-700 dark:text-emerald-400"
      : "text-zinc-800 hover:text-emerald-700 dark:text-zinc-100 dark:hover:text-emerald-400";

  return (
    <aside className="surface-card p-3">
      <div className="border-b border-zinc-100 px-2 pb-3 pt-1 dark:border-zinc-800">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t("categories")}</h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          <Link href="/categorii" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            {t("browseAllCategories")}
          </Link>
        </p>
        <Link
          href="/anunturi"
          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${linkClass(!currentCategory)}`}
        >
          <Search className="h-4 w-4 shrink-0 opacity-80" aria-hidden strokeWidth={1.75} />
          {t("allCategories")}
        </Link>
      </div>
      <nav className="max-h-[min(70vh,40rem)] overflow-y-auto px-1 py-2 pr-1">
        <ul className="space-y-3">
          {roots.map((root) => {
            const parentActive = isActiveUnder(all, currentCategory, root);
            const rootEmoji = emojiForRootSlug(root.slug);
            return (
              <li
                key={root.id}
                className="rounded-[14px] border border-zinc-200/80 bg-zinc-50/70 p-2.5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-950/60"
              >
                <details open={parentActive} className="group">
                  <summary className="flex cursor-pointer list-none items-start gap-2 border-b border-zinc-100/90 pb-2 dark:border-zinc-800">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[1.25rem] leading-none ring-1 ring-zinc-200/90 dark:bg-zinc-900 dark:ring-zinc-700"
                      aria-hidden
                    >
                      {rootEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/anunturi?category=${encodeURIComponent(root.slug)}`}
                          className={`text-sm font-bold leading-tight ${linkClass(parentActive)}`}
                        >
                          {labelFor(root, locale)}
                        </Link>
                        <div className="flex items-center gap-1">
                          <span className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 group-open:hidden dark:bg-zinc-800">
                            +
                          </span>
                          <span className="hidden rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 group-open:inline dark:bg-zinc-800">
                            −
                          </span>
                          <Link
                            href={`/categorii?c=${encodeURIComponent(root.slug)}`}
                            className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-zinc-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
                            title={t("openCategoryMap")}
                          >
                            ⊞
                          </Link>
                        </div>
                      </div>
                    </div>
                  </summary>
                  <SubTree
                    locale={locale}
                    all={all}
                    byParent={byParent}
                    parentId={root.id}
                    currentCategory={currentCategory}
                    depth={0}
                  />
                </details>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
