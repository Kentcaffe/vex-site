import { redirect } from "next/navigation";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

/** Scurtătură publică: `/reset?token=` → formularul de resetare (locale din segment). */
export default async function PasswordResetShortcutPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const token = sp.token?.trim();
  if (!token) {
    redirect(localizedHref(locale, "/cont/forgot-password"));
  }
  const dest = `${localizedHref(locale, "/cont/reset-password")}?token=${encodeURIComponent(token)}`;
  redirect(dest);
}
