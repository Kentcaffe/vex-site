import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NotificationsList } from "@/components/NotificationsList";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { Link } from "@/i18n/navigation";

/** Fields used below; avoids importing model types when IDE Prisma cache is stale. */
type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NotificariPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Notifications");

  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const rows = (await userNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })) as NotificationRow[];

  const items = rows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="app-shell app-section max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        {items.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">{t("empty")}</p>
        ) : (
          <NotificationsList items={items} />
        )}
      </div>
      <p className="mt-8 text-center text-sm">
        <Link href="/cont" className="text-emerald-700 hover:underline dark:text-emerald-400">
          ← {t("backToAccount")}
        </Link>
      </p>
    </div>
  );
}
