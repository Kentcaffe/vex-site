import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { Link } from "@/i18n/navigation";
import { isStaff } from "@/lib/auth-roles";
import { categoryPathLabels, getAllCategories } from "@/lib/category-queries";
import { formatPrice } from "@/lib/formatPrice";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  if (!isStaff(session.user.role)) {
    redirect(localizedHref(locale, "/"));
  }

  const t = await getTranslations("Admin");
  const [listings, allCats] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { category: true },
    }),
    getAllCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      {listings.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {listings.map((item) => {
            const path = categoryPathLabels(allCats, item.categoryId, locale);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link href={`/anunturi/${item.id}`} className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">{path}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatPrice(item.price, locale)} · {item.city}
                  </p>
                </div>
                <DeleteListingButton listingId={item.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
