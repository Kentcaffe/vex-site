import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { AuthForms } from "@/components/AuthForms";
import { SignOutButton } from "@/components/SignOutButton";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { chatInitials } from "@/lib/chat-ui";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Account");

  if (session?.user) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        city: true,
        bio: true,
      },
    });
    const displayName = me?.name?.trim() || session.user.email || "";
    const avatarUrl = me?.avatarUrl ?? session.user.image ?? null;

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("signedInAs", { email: me?.email ?? session.user.email ?? "" })}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-lg font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {avatarUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    </>
                  ) : (
                    <span>{chatInitials(displayName)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">{displayName}</p>
                  <p className="truncate text-xs text-zinc-500">{me?.email ?? session.user.email}</p>
                </div>
              </div>
              {me?.bio ? <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{me.bio}</p> : null}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("accountActions")}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/cont/notificari"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("linkNotifications")}
                </Link>
                <Link
                  href="/cont/favorite"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("linkFavorites")}
                </Link>
                <Link
                  href="/cont/raporteaza"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("linkReportContent")}
                </Link>
                <SignOutButton />
              </div>
            </div>
          </aside>

          <div>
            <ProfileSettingsForm
              locale={locale}
              initial={{
                name: me?.name ?? "",
                phone: me?.phone ?? "",
                city: me?.city ?? "",
                bio: me?.bio ?? "",
                avatarUrl: me?.avatarUrl ?? "",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const oauth = {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        <AuthForms oauth={oauth} />
      </div>
    </div>
  );
}
