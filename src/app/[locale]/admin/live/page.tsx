import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminLivePresencePanel } from "@/components/admin/AdminLivePresencePanel";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLiveUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Live users</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Real-time estimate of active visitors on the site.
      </p>
      <div className="mt-6">
        <AdminLivePresencePanel />
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t("shellTitle")} · auto refresh every 5 seconds.
      </p>
    </div>
  );
}

