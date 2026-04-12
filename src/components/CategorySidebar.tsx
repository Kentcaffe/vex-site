import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

/** True dacă filtrul activ e exact slug-ul sau o subcategorie din acel părinte. */
function isActiveUnderRoot(all: CategoryRow[], currentSlug: string | undefined, root: CategoryRow): boolean {
  if (!currentSlug) {
    return false;
  }
  let cur: CategoryRow | undefined = all.find((x) => x.slug === currentSlug);
  while (cur) {
    if (cur.id === root.id) {
      return true;
    }
    const pid = cur.parentId;
    cur = pid ? all.find((x) => x.id === pid) : undefined;
  }
  return false;
}

export async function CategorySidebar({ locale, all, currentCategory }: Props) {
  const t = await getTranslations("Listings");
  const byParent = buildChildrenByParent(all);
  const roots = byParent.get(null) ?? [];

  const linkClass = (active: boolean) =>
    active
      ? "font-medium text-emerald-700 dark:text-emerald-400"
      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("categories")}</h2>
      <nav className="mt-3 max-h-[min(70vh,28rem)] overflow-y-auto pr-1 text-sm">
        <ul className="space-y-1">
          <li>
            <Link href="/anunturi" className={linkClass(!currentCategory)}>
              {t("allCategories")}
            </Link>
          </li>
        </ul>
        <ul className="mt-3 space-y-4">
          {roots.map((root) => {
            const children = byParent.get(root.id) ?? [];
            const parentActive = isActiveUnderRoot(all, currentCategory, root);
            return (
              <li key={root.id}>
                <Link
                  href={`/anunturi?category=${encodeURIComponent(root.slug)}`}
                  className={`block ${linkClass(parentActive)}`}
                >
                  {labelFor(root, locale)}
                </Link>
                {children.length > 0 ? (
                  <ul className="mt-1.5 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                    {children.map((child) => {
                      const childActive = currentCategory === child.slug;
                      return (
                        <li key={child.id}>
                          <Link
                            href={`/anunturi?category=${encodeURIComponent(child.slug)}`}
                            className={`block text-[13px] leading-snug ${linkClass(childActive)}`}
                          >
                            {labelFor(child, locale)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
