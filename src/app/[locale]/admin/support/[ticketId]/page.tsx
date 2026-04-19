import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AdminSupportTicketClient } from "@/components/support";
import { supportTicket } from "@/lib/prisma-delegates";

type Props = { params: Promise<{ locale: string; ticketId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return { title: t("supportDetailTitle") };
}

export default async function AdminSupportTicketPage({ params }: Props) {
  const { locale, ticketId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  let ticket;
  try {
    ticket = await supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { email: true, name: true } },
      },
    });
  } catch (e) {
    console.error("[admin/support ticket]", e);
    return (
      <div>
        <p className="text-zinc-700">{t("supportDbUnavailable")}</p>
        <Link href="/admin/support" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
          ← {t("supportBack")}
        </Link>
      </div>
    );
  }

  if (!ticket) notFound();

  const userEmail = ticket.user?.email ?? "";
  const userName = ticket.user?.name ?? null;
  if (!userEmail) {
    return (
      <div>
        <p className="text-zinc-700">{t("supportDbUnavailable")}</p>
        <Link href="/admin/support" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
          ← {t("supportBack")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/support" className="text-sm font-medium text-emerald-700 hover:underline">
          ← {t("supportBack")}
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{t("supportDetailHeading")}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {userEmail}
        {userName ? ` · ${userName}` : ""}
      </p>

      <div className="mt-6">
        <AdminSupportTicketClient
          ticketId={ticket.id}
          initialStatus={ticket.status}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
