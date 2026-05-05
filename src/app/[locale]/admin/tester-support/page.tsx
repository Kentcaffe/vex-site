import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTesterSupportClient } from "@/components/admin/AdminTesterSupportClient";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminTesterSupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  if (!isAdmin(session.user.role)) {
    redirect(localizedHref(locale, "/admin"));
  }
  return <AdminTesterSupportClient />;
}
