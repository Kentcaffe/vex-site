import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return { title: t("supportTitle") };
}

export default async function AdminSupportListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const statusLabel = (s: string) =>
    t(`supportStatus_${s}` as "supportStatus_OPEN");

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    take: 200,
    include: {
      user: { select: { email: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });
  type TicketRow = (typeof tickets)[number];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t("supportTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">{t("supportSubtitle")}</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className="px-4 py-3 font-semibold text-zinc-700">{t("supportColUser")}</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">{t("supportColStatus")}</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">{t("supportColPreview")}</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">{t("supportColUpdated")}</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">{t("supportColAction")}</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                  {t("supportEmpty")}
                </td>
              </tr>
            ) : (
              tickets.map((row: TicketRow) => (
                <tr key={row.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/80">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-zinc-900">{row.user.email}</p>
                    {row.user.name ? <p className="text-xs text-zinc-500">{row.user.name}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800">
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 align-top text-zinc-600">
                    <span className="line-clamp-2">{row.messages[0]?.body ?? "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-500">
                    {(row.lastMessageAt ?? row.updatedAt).toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/support/${row.id}`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      {t("supportOpen")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
