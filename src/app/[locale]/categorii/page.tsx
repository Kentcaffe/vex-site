import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

type Labels = { ro?: string; ru?: string; en?: string };

function labelForLocale(labels: string, locale: string, fallback: string): string {
  try {
    const parsed = JSON.parse(labels) as Labels;
    if (locale === "ru") return parsed.ru ?? parsed.ro ?? parsed.en ?? fallback;
    if (locale === "en") return parsed.en ?? parsed.ro ?? parsed.ru ?? fallback;
    return parsed.ro ?? parsed.ru ?? parsed.en ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function CategoriiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });

  const listingsHref = localizedHref(locale, "/anunturi");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Categorii</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Total categorii: <span className="font-semibold">{categories.length}</span>
      </p>

      {categories.length === 0 ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
          Nu există categorii în baza de date încă.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
              <tr>
                <th className="px-4 py-3">Nume</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{labelForLocale(category.labels, locale, category.slug)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">{category.slug}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{category.parentId ?? "-"}</td>
                  <td className="px-4 py-3">{category.sortOrder}</td>
                  <td className="px-4 py-3">
                    <a
                      className="text-blue-700 hover:underline"
                      href={`${listingsHref}?category=${encodeURIComponent(category.slug)}`}
                    >
                      Vezi anunțuri
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
