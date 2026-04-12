import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReportQueueRow } from "@/components/admin/ReportQueueRow";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminReportsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { filter: rawFilter } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const filter = rawFilter ?? "all";
  const statusWhere =
    filter === "pending"
      ? { status: "PENDING" as const }
      : filter === "reviewed"
        ? { status: "REVIEWED" as const }
        : filter === "dismissed"
          ? { status: "DISMISSED" as const }
          : {};

  const [reports, counts] = await Promise.all([
    prisma.listingReport.findMany({
      where: Object.keys(statusWhere).length ? statusWhere : undefined,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        listing: { select: { id: true, title: true } },
        reporter: { select: { email: true } },
      },
    }),
    prisma.listingReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Record<string, number>;
  const nPending = countMap.PENDING ?? 0;
  const nReviewed = countMap.REVIEWED ?? 0;
  const nDismissed = countMap.DISMISSED ?? 0;
  const nAll = nPending + nReviewed + nDismissed;

  const filterLinks: { key: string; label: string; count: number }[] = [
    { key: "all", label: t("filterAll"), count: nAll },
    { key: "pending", label: t("filterPending"), count: nPending },
    { key: "reviewed", label: t("filterReviewed"), count: nReviewed },
    { key: "dismissed", label: t("filterDismissed"), count: nDismissed },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("reportsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("reportsSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filterLinks.map((f) => {
          const active = (f.key === "all" && filter === "all") || f.key === filter;
          const href = f.key === "all" ? "/admin/reports" : `/admin/reports?filter=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-600"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
              }`}
            >
              {f.label}
              <span
                className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                  active ? "bg-white/20" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {f.count}
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{t("reportsSummaryHint")}</p>

      {reports.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
          {t("reportsEmpty")}
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
                r.status === "PENDING"
                  ? "border-l-4 border-l-amber-500 border-zinc-200 dark:border-zinc-800"
                  : r.status === "REVIEWED"
                    ? "border-l-4 border-l-emerald-500 border-zinc-200 dark:border-zinc-800"
                    : "border-l-4 border-l-zinc-400 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <ReportQueueRow
                locale={locale}
                report={{
                  id: r.id,
                  status: r.status,
                  reason: r.reason,
                  details: r.details,
                  createdAt: r.createdAt.toISOString(),
                  listing: r.listing,
                  reporterEmail: r.reporter.email,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
