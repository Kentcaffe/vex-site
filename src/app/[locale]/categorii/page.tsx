import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
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
    notFound();
  }
  const requested = sp.c?.trim();
  const rootSlug = requested && roots.some((r) => r.slug === requested) ? requested : roots[0]!.slug;

  return <CategoryExplorer locale={locale} rootSlug={rootSlug} />;
}
