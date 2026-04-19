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
    <div className="app-shell app-section w-full max-w-full overflow-x-clip">
      <div className="surface-card p-4">
        <form
          action={searchAction}
          method="get"
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2"
        >
          <input
            type="search"
            name="search"
            placeholder={t("searchPlaceholder")}
            className="field-input min-w-0 flex-1 text-base md:text-sm"
          />
          <button type="submit" className="btn-primary w-full shrink-0 sm:w-auto sm:min-w-[120px] md:text-sm">
            {t("search")}
          </button>
        </form>
      </div>

      <div className="mt-6 flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">{t("sidebarTitle")}</p>
          <nav
            className="surface-card grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:block lg:space-y-0.5"
            aria-label={t("sidebarTitle")}
          >
            {roots.map((r) => {
              const active = r.slug === root.slug;
              const icon = CATEGORY_ROOT_EMOJI[r.slug] ?? "•";
              return (
                <Link
                  key={r.id}
                  href={`/categorii?c=${encodeURIComponent(r.slug)}`}
                  className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold sm:min-h-0 sm:justify-start sm:text-left lg:rounded lg:border-0 lg:px-2 lg:py-2 ${
                    active
                      ? "border-emerald-600 bg-emerald-100 text-emerald-950 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-900 active:bg-zinc-100 lg:border-0 lg:bg-transparent lg:hover:bg-zinc-50"
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

        <main className="surface-card min-w-0 flex-1 p-4 sm:p-6">
          <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">{rootTitle}</h1>
          <div className="mt-6 space-y-8">
            {sections.map((section) => {
              const sectionTitle = labelFromJson(section.labels, locale);
              if (section.children.length > 0) {
                return (
                  <section key={section.id}>
                    <details open className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-zinc-200 pb-2 text-base font-bold text-zinc-950">
                        <span>{sectionTitle}</span>
                        <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-800 group-open:hidden">+</span>
                        <span className="hidden rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-800 group-open:inline">−</span>
                      </summary>
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {section.children.map((leaf) => (
                        <li key={leaf.id} className="min-h-[44px]">
                          <Link
                            href={`/anunturi?category=${encodeURIComponent(leaf.slug)}`}
                            className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-base font-medium leading-snug text-zinc-900 active:bg-zinc-100 lg:min-h-0 lg:text-sm lg:hover:text-emerald-800 lg:hover:underline"
                          >
                            {labelFromJson(leaf.labels, locale)}
                          </Link>
                        </li>
                      ))}
                      </ul>
                    </details>
                  </section>
                );
              }
              return (
                <section key={section.id}>
                  <Link
                    href={`/anunturi?category=${encodeURIComponent(section.slug)}`}
                    className="flex min-h-[48px] items-center text-lg font-bold text-emerald-800 active:opacity-90 lg:inline lg:min-h-0 lg:text-base lg:hover:underline"
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
