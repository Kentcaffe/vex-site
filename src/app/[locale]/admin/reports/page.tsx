import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReportQueueRow } from "@/components/admin/ReportQueueRow";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const reports = await prisma.listingReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 150,
    include: {
      listing: { select: { id: true, title: true } },
      reporter: { select: { email: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("reportsTitle")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("reportsSubtitle")}</p>

      {reports.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("reportsEmpty")}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
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
