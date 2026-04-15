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
    <div className="w-full max-w-full overflow-x-clip bg-zinc-100/90 pb-12 pt-2 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <form
          action={searchAction}
          method="get"
          className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-stretch sm:gap-2 sm:px-4"
        >
          <input
            type="search"
            name="search"
            placeholder={t("searchPlaceholder")}
            className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 md:text-sm"
          />
          <button
            type="submit"
            className="min-h-[48px] w-full shrink-0 touch-manipulation rounded-xl bg-[#0b57d0] px-6 text-base font-semibold text-white active:bg-[#0842a0] sm:w-auto sm:min-w-[120px] md:text-sm lg:hover:bg-[#0842a0]"
          >
            {t("search")}
          </button>
        </form>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-4">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("sidebarTitle")}</p>
          <nav
            className="grid grid-cols-2 gap-2 border-0 sm:gap-2 lg:block lg:space-y-0.5 lg:border lg:border-zinc-200 lg:bg-white lg:p-2 lg:dark:border-zinc-800 lg:dark:bg-zinc-900"
            aria-label={t("sidebarTitle")}
          >
            {roots.map((r) => {
              const active = r.slug === root.slug;
              const icon = CATEGORY_ROOT_EMOJI[r.slug] ?? "•";
              return (
                <Link
                  key={r.id}
                  href={`/categorii?c=${encodeURIComponent(r.slug)}`}
                  className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm font-medium sm:min-h-0 sm:justify-start sm:text-left lg:rounded lg:border-0 lg:px-2 lg:py-2 ${
                    active
                      ? "border-sky-200 bg-sky-50 font-semibold text-[#0b57d0] dark:border-sky-900 dark:bg-sky-950/40 dark:text-blue-400"
                      : "border-zinc-200 bg-white text-[#0b57d0] active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:dark:hover:bg-zinc-800 lg:hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-xl lg:w-6 lg:text-center" aria-hidden>
                    {icon}
                  </span>
                  <span className="line-clamp-2 leading-tight">{labelFromJson(r.labels, locale)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">{rootTitle}</h1>
          <div className="mt-6 space-y-8">
            {sections.map((section) => {
              const sectionTitle = labelFromJson(section.labels, locale);
              if (section.children.length > 0) {
                return (
                  <section key={section.id}>
                    <h2 className="border-b border-zinc-200 pb-2 text-base font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
                      {sectionTitle}
                    </h2>
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {section.children.map((leaf) => (
                        <li key={leaf.id} className="min-h-[44px]">
                          <Link
                            href={`/anunturi?category=${encodeURIComponent(leaf.slug)}`}
                            className="flex min-h-[44px] items-center rounded-lg px-1 py-1 text-base leading-snug text-[#0b57d0] active:bg-zinc-100 dark:text-blue-400 dark:active:bg-zinc-900 lg:min-h-0 lg:text-sm lg:hover:underline"
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
                    className="flex min-h-[48px] items-center text-lg font-semibold text-[#0b57d0] active:opacity-80 dark:text-blue-400 lg:inline lg:min-h-0 lg:text-base lg:hover:underline"
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
