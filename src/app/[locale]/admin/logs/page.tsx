import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";
import type { Prisma } from "@prisma/client";
import { adminLog } from "@/lib/prisma-delegates";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function AdminLogsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect(localizedHref(locale, "/admin"));
  }

  const t = await getTranslations("Admin");

  type AdminLogRow = {
    id: string;
    targetId: string;
    action: string;
    createdAt: Date;
    admin: { email: string | null; name: string | null };
  };

  const rows = (await adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      admin: { select: { email: true, name: true } },
    },
  })) as unknown as AdminLogRow[];

  const listingIds = [...new Set(rows.map((r) => r.targetId))];
  const listings =
    listingIds.length === 0
      ? []
      : ((await prisma.listing.findMany({
          where: { id: { in: listingIds } },
          select: {
            id: true,
            title: true,
            city: true,
            isDeleted: true,
          } as Prisma.ListingSelect,
        })) as unknown as Array<{ id: string; title: string; city: string; isDeleted: boolean }>);
  const listingMap = new Map(listings.map((l) => [l.id, l]));

  function actionLabel(action: string): string {
    if (action === "DELETE_LISTING") return t("logActionDelete");
    if (action === "RESTORE_LISTING") return t("logActionRestore");
    if (action === "PERMANENT_DELETE_LISTING") return t("logActionPermanent");
    return action;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("logsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("logsSubtitle")}</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("logsEmpty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("logsColWhen")}</th>
                <th className="px-4 py-3">{t("logsColAction")}</th>
                <th className="px-4 py-3">{t("logsColAdmin")}</th>
                <th className="px-4 py-3">{t("logsColListing")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((row) => {
                const listing = listingMap.get(row.targetId);
                const title = listing?.title ?? `ID ${row.targetId}`;
                const href = listing
                  ? listingSeoPath({ id: listing.id, title: listing.title, city: listing.city })
                  : null;
                return (
                  <tr key={row.id} className="align-top hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                      {new Date(row.createdAt).toLocaleString(locale)}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{actionLabel(row.action)}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {row.admin.name || row.admin.email}
                    </td>
                    <td className="px-4 py-3">
                      {href ? (
                        <Link href={href} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                          {title}
                        </Link>
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{title}</span>
                      )}
                      {listing?.isDeleted ? (
                        <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                          {t("logListingInTrash")}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
