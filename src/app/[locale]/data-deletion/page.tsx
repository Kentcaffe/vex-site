import { redirect } from "next/navigation";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

/** Redirecție permanentă către ruta RO /stergere-date. */
export default async function DataDeletionRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(localizedHref(locale, "/stergere-date"));
}
