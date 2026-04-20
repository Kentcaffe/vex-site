import dynamic from "next/dynamic";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategoryTreeForPicker } from "@/lib/category-queries";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

const ListingForm = dynamic(
  () => import("@/components/ListingForm").then((m) => m.ListingForm),
  {
    loading: () => (
      <div
        className="animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50/90 p-12 min-h-[min(70vh,480px)]"
        aria-hidden
      />
    ),
  },
);

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
    <div className="app-shell app-section">
      <h1 className="page-heading text-2xl sm:text-3xl">{t("title")}</h1>
      <p className="page-subheading mt-2">{t("subtitle")}</p>
      <div className="mt-8">
        <ListingForm locale={locale} userId={session.user.id} categoryTree={categoryTree} />
      </div>
    </div>
  );
}
