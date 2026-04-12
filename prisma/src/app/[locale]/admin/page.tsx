import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { formatPrice } from "@/lib/formatPrice";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ModeratorDeleteListingButton } from "@/components/ModeratorDeleteListingButton";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id || !isStaff(session.user.role)) {
    notFound();
  }

  const [t, tNav, listings] = await Promise.all([
    getTranslations("Admin"),
    getTranslations("Nav"),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { email: true } },
        category: { select: { slug: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">
            <Link href="/" className="underline-offset-4 hover:underline">
              {tNav("home")}
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <p className="text-xs text-zinc-500">
          {session.user.role === "ADMIN" ? t("roleAdmin") : t("roleModerator")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">{t("colTitle")}</th>
              <th className="px-4 py-3">{t("colAuthor")}</th>
              <th className="px-4 py-3">{t("colPrice")}</th>
              <th className="px-4 py-3">{t("colDate")}</th>
              <th className="px-4 py-3 text-right">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              listings.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="max-w-[280px] px-4 py-3">
                    <Link
                      href={`/anunturi/${row.id}`}
                      className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                    >
                      {row.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{row.city}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{row.user.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatPrice(row.price, locale)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                    {row.createdAt.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ModeratorDeleteListingButton listingId={row.id} variant="dangerInline" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-zinc-500">{t("promoteHint")}</p>
    </div>
  );
}
