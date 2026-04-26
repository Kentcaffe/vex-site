import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { otherContentReport } from "@/lib/prisma-delegates";
import { countOpenSupportTicketsSafe } from "@/lib/support-db-safe";
import { getPresenceStats } from "@/lib/live-presence-store";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  let t: Awaited<ReturnType<typeof getTranslations>>;
  try {
    t = await getTranslations("Admin");
  } catch (error) {
    console.error("[admin] translations failed", error);
    return (
      <div>
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Nu am putut încărca această pagină momentan.
        </p>
      </div>
    );
  }

  let listingCount = 0;
  let userCount = 0;
  let supportOpen = 0;
  let lp = 0;
  let lr = 0;
  let ld = 0;
  let op = 0;
  let or = 0;
  let od = 0;
  let loadFailed = false;
  try {
    [listingCount, userCount, supportOpen, lp, lr, ld, op, or, od] = await Promise.all([
      prisma.listing.count({ where: listingWhereActive() }),
      prisma.user.count(),
      countOpenSupportTicketsSafe(),
      prisma.listingReport.count({ where: { status: "PENDING" } }),
      prisma.listingReport.count({ where: { status: "REVIEWED" } }),
      prisma.listingReport.count({ where: { status: "DISMISSED" } }),
      otherContentReport.count({ where: { status: "PENDING" } }),
      otherContentReport.count({ where: { status: "REVIEWED" } }),
      otherContentReport.count({ where: { status: "DISMISSED" } }),
    ]);
  } catch (error) {
    console.error("[admin] dashboard stats failed", error);
    loadFailed = true;
  }
  const pendingReports = lp + op;
  const reviewedReports = lr + or;
  const dismissedReports = ld + od;
  const live = getPresenceStats();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("dashboardTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("dashboardSubtitle")}</p>

      {loadFailed ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Statisticile admin sunt temporar indisponibile.
        </p>
      ) : null}

      {pendingReports > 0 ? (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-950 dark:text-amber-100">{t("dashboardAttention")}</p>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-200/90">
            {t("dashboardAttentionDesc", { count: pendingReports })}
          </p>
          <Link
            href="/admin/reclamatii?status=pending"
            className="mt-3 inline-flex text-sm font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-50"
          >
            {t("dashboardOpenQueue")} →
          </Link>
        </div>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <li>
          <Link
            href="/admin/listings"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-400/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statListings")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{listingCount}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/users"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-400/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statUsers")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{userCount}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/support"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statSupportOpen")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{supportOpen}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-sky-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Vizitatori live (estimativ)
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{live.total}</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Logați: {live.authenticated} · Guest: {live.guests}
            </p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/reclamatii?status=pending"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statPendingReports")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{pendingReports}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/reclamatii?status=reviewed"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-400/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statResolvedReports")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{reviewedReports}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/reclamatii?status=dismissed"
            className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("statDismissedReports")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{dismissedReports}</p>
            <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
