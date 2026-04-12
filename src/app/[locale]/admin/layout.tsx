import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
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

  return <AdminShell>{children}</AdminShell>;
}
