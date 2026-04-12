import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [listingCount, userCount, pendingReports, reviewedReports] = await Promise.all([
    prisma.listing.count(),
    prisma.user.count(),
    prisma.listingReport.count({ where: { status: "PENDING" } }),
    prisma.listingReport.count({ where: { status: "REVIEWED" } }),
  ]);

  const cards: {
    label: string;
    value: number;
    href?: "/admin/listings" | "/admin/reports";
  }[] = [
    { label: t("statListings"), value: listingCount, href: "/admin/listings" },
    { label: t("statUsers"), value: userCount },
    { label: t("statPendingReports"), value: pendingReports, href: "/admin/reports" },
    { label: t("statResolvedReports"), value: reviewedReports, href: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("dashboardTitle")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("dashboardSubtitle")}</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.label}>
            {c.href ? (
              <Link
                href={c.href}
                className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
              >
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{c.value}</p>
                <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t("openSection")} →</p>
              </Link>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{c.value}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
