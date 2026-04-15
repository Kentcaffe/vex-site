import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ListingForm } from "@/components/ListingForm";
import { getCategoryTreeForPicker } from "@/lib/category-queries";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PublicaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const t = await getTranslations("Publish");
  const categoryTree = await getCategoryTreeForPicker(locale);

  if (categoryTree.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-zinc-600 dark:text-zinc-400">{t("noCategories")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        <ListingForm locale={locale} userId={session.user.id} categoryTree={categoryTree} />
      </div>
    </div>
  );
}
