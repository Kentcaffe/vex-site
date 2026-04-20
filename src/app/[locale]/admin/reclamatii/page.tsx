import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { OtherReportRow } from "@/components/admin/OtherReportRow";
import { ReportQueueRow } from "@/components/admin/ReportQueueRow";
import { prisma } from "@/lib/prisma";
import { otherContentReport } from "@/lib/prisma-delegates";
import { Link } from "@/i18n/navigation";
import type { ReportStatus } from "@prisma/client";

/** Explicit row shapes (avoids stale Prisma/IDE type lag after `prisma generate`). */
type ListingReportRow = {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  listing: { id: string; title: string };
  reporter: { email: string };
};

type OtherContentReportRow = {
  id: string;
  reporterId: string;
  kind: string;
  subject: string;
  contextUrl: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  reporter: { email: string };
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; type?: string }>;
};

function statusWhere(raw: string | undefined): ReportStatus | undefined {
  if (raw === "pending") return "PENDING";
  if (raw === "reviewed") return "REVIEWED";
  if (raw === "dismissed") return "DISMISSED";
  return undefined;
}

export default async function AdminReclamatiiPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const session = await auth();
  const canDeleteListing = isAdmin(session?.user?.role);

  const st = statusWhere(sp.status);
  const type = sp.type ?? "all";

  const statusFilter = st ? { status: st } : undefined;

  const [lCounts, oCounts] = await Promise.all([
    prisma.listingReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    otherContentReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const listingRows: ListingReportRow[] =
    type === "other"
      ? []
      : ((await prisma.listingReport.findMany({
          where: statusFilter,
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 250,
          include: {
            listing: { select: { id: true, title: true } },
            reporter: { select: { email: true } },
          },
        })) as ListingReportRow[]);

  const otherRows: OtherContentReportRow[] =
    type === "listing"
      ? []
      : ((await otherContentReport.findMany({
          where: statusFilter,
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 250,
          include: {
            reporter: { select: { email: true } },
          },
        })) as OtherContentReportRow[]);

  const lm = Object.fromEntries(
    lCounts.map((c: (typeof lCounts)[number]) => [c.status, c._count._all]),
  ) as Record<string, number>;
  const om = Object.fromEntries(
    oCounts.map((c: (typeof oCounts)[number]) => [c.status, c._count._all]),
  ) as Record<string, number>;
  const nPending = (lm.PENDING ?? 0) + (om.PENDING ?? 0);
  const nReviewed = (lm.REVIEWED ?? 0) + (om.REVIEWED ?? 0);
  const nDismissed = (lm.DISMISSED ?? 0) + (om.DISMISSED ?? 0);
  const nAll = nPending + nReviewed + nDismissed;

  const merged = [
    ...listingRows.map((row) => ({ kind: "listing" as const, at: row.createdAt, row })),
    ...otherRows.map((row) => ({ kind: "other" as const, at: row.createdAt, row })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  const statusKey = sp.status ?? "all";
  const typeKey = type;

  const statusLinks: { key: string; label: string; count: number }[] = [
    { key: "all", label: t("filterAll"), count: nAll },
    { key: "pending", label: t("filterPending"), count: nPending },
    { key: "reviewed", label: t("filterReviewed"), count: nReviewed },
    { key: "dismissed", label: t("filterDismissed"), count: nDismissed },
  ];

  const baseQuery = (nextStatus: string, nextType: string) => {
    const q = new URLSearchParams();
    if (nextStatus !== "all") q.set("status", nextStatus);
    if (nextType !== "all") q.set("type", nextType);
    const s = q.toString();
    return s ? `/admin/reclamatii?${s}` : "/admin/reclamatii";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("complaintsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("complaintsSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("complaintFilterType")}:</span>
        {(
          [
            { key: "all", label: t("complaintTypeAll") },
            { key: "listing", label: t("complaintTypeListing") },
            { key: "other", label: t("complaintTypeOther") },
          ] as const
        ).map((f) => {
          const active = typeKey === f.key;
          return (
            <Link
              key={f.key}
              href={baseQuery(statusKey === "all" ? "all" : statusKey, f.key)}
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusLinks.map((f) => {
          const active = (f.key === "all" && statusKey === "all") || f.key === statusKey;
          const href = baseQuery(f.key, typeKey);
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

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{t("complaintsHint")}</p>

      {merged.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
          {t("reportsEmpty")}
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {merged.map((item) => {
            if (item.kind === "listing") {
              const r = item.row;
              return (
                <li
                  key={`l-${r.id}`}
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
                    canDeleteListing={canDeleteListing}
                    report={{
                      id: r.id,
                      status: r.status,
                      reason: r.reason,
                      details: r.details,
                      resolutionNote: r.resolutionNote,
                      createdAt: r.createdAt.toISOString(),
                      listing: r.listing,
                      reporterEmail: r.reporter.email,
                    }}
                  />
                </li>
              );
            }
            const r = item.row;
            return (
              <li
                key={`o-${r.id}`}
                className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
                  r.status === "PENDING"
                    ? "border-l-4 border-l-amber-500 border-zinc-200 dark:border-zinc-800"
                    : r.status === "REVIEWED"
                      ? "border-l-4 border-l-emerald-500 border-zinc-200 dark:border-zinc-800"
                      : "border-l-4 border-l-zinc-400 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <OtherReportRow
                  locale={locale}
                  report={{
                    id: r.id,
                    kind: r.kind,
                    status: r.status,
                    reason: r.reason,
                    details: r.details,
                    subject: r.subject,
                    contextUrl: r.contextUrl,
                    resolutionNote: r.resolutionNote,
                    createdAt: r.createdAt.toISOString(),
                    reporterEmail: r.reporter.email,
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
