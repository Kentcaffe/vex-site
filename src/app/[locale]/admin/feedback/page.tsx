import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminFeedbackList, type AdminFeedbackRow } from "@/components/admin/AdminFeedbackList";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { feedback } from "@/lib/prisma-delegates";

/** Tip explicit pentru rândul din listă (delegates Prisma folosesc `any`). */
type AdminFeedbackQueryRow = {
  id: string;
  message: string;
  email: string | null;
  createdAt: Date;
  user: { email: string; name: string | null } | null;
  replies: Array<{
    id: string;
    reply: string;
    createdAt: Date;
    admin: { email: string; name: string | null };
  }>;
};

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    redirect(localizedHref(locale, "/admin"));
  }

  const t = await getTranslations("Admin");

  let rows: AdminFeedbackQueryRow[] = [];
  let loadFailed = false;

  try {
    rows = (await feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { email: true, name: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { admin: { select: { email: true, name: true } } },
        },
      },
    })) as AdminFeedbackQueryRow[];
  } catch (error) {
    console.error("[admin/feedback] feedback.findMany a eșuat (tabel lipsă sau DB indisponibil).", error);
    loadFailed = true;
    rows = [];
  }

  const items: AdminFeedbackRow[] = loadFailed
    ? []
    : rows.map((fb) => {
        const userLabel = fb.user
          ? fb.user.name?.trim() || fb.user.email?.trim() || fb.user.email
          : t("feedbackGuest");
        const email = fb.email?.trim() || fb.user?.email?.trim() || null;

        return {
          id: fb.id,
          message: fb.message,
          createdAt: fb.createdAt.toISOString(),
          email,
          userLabel,
          replies: fb.replies.map((r) => ({
            id: r.id,
            reply: r.reply,
            createdAt: r.createdAt.toISOString(),
            adminLabel: r.admin.name?.trim() || r.admin.email || "Admin",
          })),
        };
      });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("feedbackTitle")}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("feedbackSubtitle")}</p>

      {loadFailed ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          {t("feedbackLoadError")}
        </p>
      ) : (
        <div className="mt-8">
          <AdminFeedbackList items={items} />
        </div>
      )}
    </div>
  );
}
