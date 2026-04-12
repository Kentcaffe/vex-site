import { auth } from "@/auth";
import { ListingForm } from "@/components/ListingForm";
import { Link } from "@/i18n/navigation";
import { categoryPathLabels, getAllCategories, getLeafCategories } from "@/lib/category-queries";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PublicaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Listings");

  const [allCats, leaves] = await Promise.all([getAllCategories(), getLeafCategories()]);

  const categoryOptions = leaves.map((c) => ({
    id: c.id,
    slug: c.slug,
    path: categoryPathLabels(allCats, c.id, locale),
  }));

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 sm:px-6">
        <p className="text-zinc-600 dark:text-zinc-400">{t("loginToPost")}</p>
        <Link
          href="/cont"
          className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t("goToAccount")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">{t("submit")}</h1>
      <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">{t("publishIntro")}</p>
      <ListingForm locale={locale} categoryOptions={categoryOptions} />
    </div>
  );
}
