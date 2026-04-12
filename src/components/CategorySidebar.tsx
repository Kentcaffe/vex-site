import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { emojiForCategorySlug, emojiForRootSlug } from "@/lib/category-icons";
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
    <ul className={`space-y-0.5 ${depth === 0 ? "mt-2 border-l-2 border-sky-200/80 pl-2 dark:border-sky-800/60" : depth === 1 ? "ml-1 border-l border-zinc-200 pl-2 dark:border-zinc-700" : "ml-1 border-l border-zinc-100 pl-2 dark:border-zinc-800"}`}>
      {kids.map((node) => {
        const active = isActiveSlug(currentCategory, node.slug);
        const hasKids = (byParent.get(node.id)?.length ?? 0) > 0;
        const icon = depth <= 2 ? emojiForCategorySlug(node.slug) : "·";
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
              <span
                className={`mt-0.5 shrink-0 text-center ${depth === 0 ? "text-[15px]" : depth === 1 ? "text-[13px]" : "text-[11px] text-zinc-400"}`}
                aria-hidden
              >
                {icon}
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
                    : "text-zinc-600 hover:text-[#0b57d0] dark:text-zinc-400 dark:hover:text-blue-400"
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
      : "text-zinc-800 hover:text-[#0b57d0] dark:text-zinc-100 dark:hover:text-blue-400";

  return (
    <aside className="rounded-2xl border border-zinc-200/90 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-3 pb-3 pt-3 dark:border-zinc-800">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("categories")}</h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          <Link href="/categorii" className="font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
            {t("browseAllCategories")}
          </Link>
        </p>
        <Link
          href="/anunturi"
          className={`mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${linkClass(!currentCategory)}`}
        >
          <span className="text-base" aria-hidden>
            🔍
          </span>
          {t("allCategories")}
        </Link>
      </div>
      <nav className="max-h-[min(70vh,36rem)] overflow-y-auto px-2 py-2 pr-1">
        <ul className="space-y-3">
          {roots.map((root) => {
            const parentActive = isActiveUnder(all, currentCategory, root);
            const rootEmoji = emojiForRootSlug(root.slug);
            return (
              <li
                key={root.id}
                className="rounded-xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/90 p-2.5 shadow-sm dark:border-zinc-700/80 dark:from-zinc-900 dark:to-zinc-950/90"
              >
                <div className="flex items-start gap-2 border-b border-zinc-100/90 pb-2 dark:border-zinc-800">
                  <span className="text-2xl leading-none" aria-hidden>
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
                      <Link
                        href={`/categorii?c=${encodeURIComponent(root.slug)}`}
                        className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 hover:bg-sky-100 hover:text-[#0b57d0] dark:bg-zinc-800 dark:hover:bg-sky-950 dark:hover:text-blue-400"
                        title={t("openCategoryMap")}
                      >
                        ⊞
                      </Link>
                    </div>
                  </div>
                </div>
                <SubTree
                  locale={locale}
                  all={all}
                  byParent={byParent}
                  parentId={root.id}
                  currentCategory={currentCategory}
                  depth={0}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
