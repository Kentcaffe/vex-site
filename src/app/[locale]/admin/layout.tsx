import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  if (!isStaff(session.user.role)) {
    redirect(localizedHref(locale, "/"));
  }

  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col lg:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{t("shellTitle")}</p>
        {children}
      </div>
    </div>
  );
}
