import { setRequestLocale } from "next-intl/server";
import { CategoryExplorer } from "@/components/categories/CategoryExplorer";
import { getRootCategories } from "@/lib/category-queries";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ c?: string }>;
};

export default async function CategoriiPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const roots = await getRootCategories();
  if (roots.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">Categorii</h1>
        <p className="mt-3 text-sm text-zinc-600">Nu am găsit categorii disponibile.</p>
      </main>
    );
  }

  const requested = sp.c?.trim();
  const rootSlug = requested && roots.some((r) => r.slug === requested) ? requested : roots[0]!.slug;

  return <CategoryExplorer locale={locale} rootSlug={rootSlug} />;
}
