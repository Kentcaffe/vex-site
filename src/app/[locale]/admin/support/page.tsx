import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { SupportMessageSenderRole, SupportTicketStatus } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { supportTicket } from "@/lib/prisma-delegates";

const RECENT_OPEN_DAYS = 14;

type SupportListView = "all" | "recent" | "unanswered" | "closed";

function parseSupportListView(v: string | undefined): SupportListView {
  if (v === "recent" || v === "unanswered" || v === "closed") return v;
  return "all";
}

function supportListHref(view: SupportListView): string {
  return view === "all" ? "/admin/support" : `/admin/support?v=${view}`;
}

/** Rând listă — tip explicit (Prisma 7 nu exportă `SupportTicketGetPayload` pe namespace-ul `Prisma`). */
type SupportListRow = {
  id: string;
  status: SupportTicketStatus;
  user: { email: string; name: string | null };
  messages: { body: string }[];
  lastMessageAt: Date | null;
  updatedAt: Date;
};

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ v?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return { title: t("supportTitle") };
}

export default async function AdminSupportListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const listView = parseSupportListView(typeof sp.v === "string" ? sp.v : undefined);

  const statusLabel = (s: string) => {
    const key = `supportStatus_${String(s).toUpperCase()}` as "supportStatus_OPEN";
    try {
      return t(key);
    } catch {
      return s || "UNKNOWN";
    }
  };

  const formatUpdated = (last: Date | null, updated: Date, loc: string) => {
    try {
      const d = last ?? updated;
      const dt = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(dt.getTime())) return "—";
      return dt.toLocaleString(loc);
    } catch {
      return "—";
    }
  };

  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - RECENT_OPEN_DAYS);

  let where: Prisma.SupportTicketWhereInput = {};
  let orderBy: Prisma.SupportTicketOrderByWithRelationInput[] = [
    { lastMessageAt: "desc" },
    { updatedAt: "desc" },
  ];

  switch (listView) {
    case "recent":
      where = {
        status: { in: [SupportTicketStatus.OPEN, SupportTicketStatus.PENDING] },
        createdAt: { gte: recentSince },
      };
      orderBy = [{ createdAt: "desc" }];
      break;
    case "unanswered":
      where = {
        status: { in: [SupportTicketStatus.OPEN, SupportTicketStatus.PENDING] },
        messages: { none: { senderRole: SupportMessageSenderRole.ADMIN } },
      };
      orderBy = [{ createdAt: "asc" }];
      break;
    case "closed":
      where = { status: SupportTicketStatus.CLOSED };
      orderBy = [{ lastMessageAt: "desc" }, { updatedAt: "desc" }];
      break;
    default:
      break;
  }

  let tickets: SupportListRow[] = [];
  let supportDbError = false;
  try {
    tickets = await supportTicket.findMany({
      where,
      orderBy,
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
  } catch (e) {
    console.error("[admin/support list]", e);
    supportDbError = true;
  }
  type TicketRow = (typeof tickets)[number];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t("supportTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">{t("supportSubtitle")}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("supportFilterLabel")}:
        </span>
        {(
          [
            { key: "all" as const, label: t("supportFilterAll") },
            { key: "recent" as const, label: t("supportFilterRecent") },
            { key: "unanswered" as const, label: t("supportFilterUnanswered") },
            { key: "closed" as const, label: t("supportFilterClosed") },
          ] as const
        ).map((f) => {
          const active = listView === f.key;
          return (
            <Link
              key={f.key}
              href={supportListHref(f.key)}
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {listView === "recent" ? (
        <p className="mt-3 text-xs text-zinc-500">{t("supportFilterRecentHint", { days: RECENT_OPEN_DAYS })}</p>
      ) : null}
      {listView === "unanswered" ? (
        <p className="mt-3 text-xs text-zinc-500">{t("supportFilterUnansweredHint")}</p>
      ) : null}

      {supportDbError ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {t("supportDbUnavailable")}
        </div>
      ) : null}

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
                  {listView === "recent"
                    ? t("supportEmptyRecent")
                    : listView === "unanswered"
                      ? t("supportEmptyUnanswered")
                      : listView === "closed"
                        ? t("supportEmptyClosed")
                        : t("supportEmpty")}
                </td>
              </tr>
            ) : (
              tickets.map((row: TicketRow) => (
                <tr key={row.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/80">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-zinc-900">{row.user?.email ?? "—"}</p>
                    {row.user?.name ? <p className="text-xs text-zinc-500">{row.user.name}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800">
                      {statusLabel(String(row.status ?? ""))}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 align-top text-zinc-600">
                    <span className="line-clamp-2">{row.messages[0]?.body ?? "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-500">
                    {formatUpdated(row.lastMessageAt, row.updatedAt, locale)}
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
