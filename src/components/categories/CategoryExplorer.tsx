import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";
import { CATEGORY_ROOT_EMOJI } from "@/lib/category-icons";
import { getAllCategories } from "@/lib/category-queries";

type Cat = {
  id: string;
  slug: string;
  labels: string;
  children: Cat[];
};

function labelFromJson(labels: string, locale: string): string {
  try {
    const L = JSON.parse(labels) as { ro?: string; ru?: string; en?: string };
    return L[locale as keyof typeof L] ?? L.ro ?? "";
  } catch {
    return "";
  }
}

type Props = {
  locale: string;
  rootSlug: string;
};

export async function CategoryExplorer({ locale, rootSlug }: Props) {
  const t = await getTranslations("CategoriesPage");

  const all = await getAllCategories();
  const roots = all.filter((c) => c.parentId === null);

  const root = roots.find((r) => r.slug === rootSlug) ?? roots[0];
  if (!root) {
    return null;
  }

  const rawSections = all
    .filter((c) => c.parentId === root.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

  const sections: Cat[] = rawSections.map((s) => ({
    id: s.id,
    slug: s.slug,
    labels: s.labels,
    children: all
      .filter((c) => c.parentId === s.id)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
      .map((ch) => ({ id: ch.id, slug: ch.slug, labels: ch.labels, children: [] })),
  }));

  const rootTitle = labelFromJson(root.labels, locale);
  const searchAction = localizedHref(locale, "/anunturi");

  return (
    <div className="bg-zinc-100/90 pb-12 pt-2 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <form action={searchAction} method="get" className="mx-auto flex max-w-[1200px] gap-2 px-3 py-3 sm:px-4">
          <input
            type="search"
            name="search"
            placeholder={t("searchPlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0842a0]"
          >
            {t("search")}
          </button>
        </form>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-3 py-6 sm:px-4 lg:flex-row lg:items-start">
        <aside className="shrink-0 lg:w-56">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("sidebarTitle")}</p>
          <nav className="space-y-0.5 border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {roots.map((r) => {
              const active = r.slug === root.slug;
              const icon = CATEGORY_ROOT_EMOJI[r.slug] ?? "•";
              return (
                <Link
                  key={r.id}
                  href={`/categorii?c=${encodeURIComponent(r.slug)}`}
                  className={`flex items-center gap-2 rounded px-2 py-2 ${
                    active ? "bg-sky-50 font-medium text-[#0b57d0] dark:bg-sky-950/40 dark:text-blue-400" : "text-[#0b57d0] hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="w-6 text-center" aria-hidden>
                    {icon}
                  </span>
                  <span>{labelFromJson(r.labels, locale)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{rootTitle}</h1>
          <div className="mt-6 space-y-8">
            {sections.map((section) => {
              const sectionTitle = labelFromJson(section.labels, locale);
              if (section.children.length > 0) {
                return (
                  <section key={section.id}>
                    <h2 className="border-b border-zinc-200 pb-2 text-base font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
                      {sectionTitle}
                    </h2>
                    <ul className="mt-3 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
                      {section.children.map((leaf) => (
                        <li key={leaf.id} className="mb-2 break-inside-avoid">
                          <Link
                            href={`/anunturi?category=${encodeURIComponent(leaf.slug)}`}
                            className="text-sm text-[#0b57d0] hover:underline dark:text-blue-400"
                          >
                            {labelFromJson(leaf.labels, locale)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              }
              return (
                <section key={section.id}>
                  <Link
                    href={`/anunturi?category=${encodeURIComponent(section.slug)}`}
                    className="text-base font-semibold text-[#0b57d0] hover:underline dark:text-blue-400"
                  >
                    {sectionTitle}
                  </Link>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
