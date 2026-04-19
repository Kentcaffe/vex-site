import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CategoryExplorer } from "@/components/categories/CategoryExplorer";
import { getRootCategories } from "@/lib/category-queries";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ c?: string }>;
};

function labelFromJson(labels: string, locale: string): string {
  try {
    const L = JSON.parse(labels) as { ro?: string; ru?: string; en?: string };
    return L[locale as keyof typeof L] ?? L.ro ?? "";
  } catch {
    return "";
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const roots = await getRootCategories();
  const requested = sp.c?.trim();
  const selected = requested && roots.some((r) => r.slug === requested) ? roots.find((r) => r.slug === requested) : roots[0];
  const selectedLabel = selected ? labelFromJson(selected.labels, locale) : "Categorii";
  const isTransport = selected?.slug?.includes("transport");
  const titleTail = isTransport ? "Anunțuri auto Moldova" : "Anunțuri gratuite Moldova";
  return {
    title: `${selectedLabel} - ${titleTail}`,
    description: `Descoperă subcategorii și anunțuri pentru ${selectedLabel} pe VEX Moldova.`,
  };
}

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
