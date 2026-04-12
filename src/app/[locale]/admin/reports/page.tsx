import { redirect } from "next/navigation";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Redirecție: vezi panoul unificat „Reclamații”. */
export default async function AdminReportsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(localizedHref(locale, "/admin/reclamatii"));
}
