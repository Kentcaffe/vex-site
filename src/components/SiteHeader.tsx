import { getLocale, getTranslations } from "next-intl/server";
import { Bell, Heart, LogOut, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { canAccessTesterDashboard, isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { ChatInboxLink } from "@/components/chat/ChatInboxLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { resolvePublicMediaUrl } from "@/lib/media-url";

export async function SiteHeader() {
  const session = await auth();
  const locale = await getLocale();
  const [t, tAuth, unreadNotifications] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Auth"),
    session?.user?.id
      ? userNotification.count({ where: { userId: session.user.id, read: false } })
      : Promise.resolve(0),
  ]);

  const accountHref = localizedHref(locale, "/cont");
  const publishHref = localizedHref(locale, "/publica");
  const anunturiHref = localizedHref(locale, "/anunturi");
  const ajutorHref = localizedHref(locale, "/ajutor");
  const notificariHref = localizedHref(locale, "/cont/notificari");
  const favoriteHref = localizedHref(locale, "/cont/favorite");
  const canAccessTester = session?.user?.role ? canAccessTesterDashboard(session.user.role) : false;
  const avatarSrc = session?.user?.image ? resolvePublicMediaUrl(session.user.image) : null;
  const displayName = session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-[100] w-full max-w-[100vw] border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Link href="/" className="text-xl font-medium tracking-tight text-[#0f172a]" title="VEX">
            VEX
          </Link>
          <div className="flex items-center gap-2">
            {!session?.user ? (
              <Link
                href={accountHref}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-[#e2e8f0] px-3 text-sm font-medium text-[#334155]"
              >
                {t("connect")}
              </Link>
            ) : null}
            <Link
              href={publishHref}
              className="inline-flex min-h-[40px] items-center rounded-xl bg-[#1a56db] px-3 text-sm font-medium text-white"
            >
              {t("publish")}
            </Link>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="shrink-0 text-xl font-medium tracking-tight text-[#0f172a]" title="VEX">
            VEX
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-[#475569]" aria-label="Principal">
            <Link href={anunturiHref} className="transition hover:text-[#1a56db]">
              {t("listings")}
            </Link>
            <Link href="/categorii" className="transition hover:text-[#1a56db]">
              {t("categories")}
            </Link>
            <Link href={ajutorHref} className="transition hover:text-[#1a56db]">
              {t("help")}
            </Link>
            {canAccessTester ? (
              <Link href="/tester/dashboard" className="transition hover:text-[#1a56db]">
                {t("tester")}
              </Link>
            ) : null}
            {session?.user && isStaff(session.user.role) ? (
              <Link href="/admin" className="transition hover:text-[#1a56db]">
                {t("admin")}
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <LanguageSwitcher />

            {session?.user ? (
              <>
                <ChatInboxLink variant="icon" />
                <Link
                  href={notificariHref}
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition hover:border-[#1a56db]/30 hover:text-[#1a56db]"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a56db] px-0.5 text-[9px] font-medium text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={favoriteHref}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition hover:border-[#1a56db]/30 hover:text-[#1a56db]"
                  aria-label={t("favorites")}
                >
                  <Heart className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Link>

                <Link
                  href={accountHref}
                  className="flex max-w-[200px] min-w-0 items-center gap-2 rounded-xl border border-[#e2e8f0] py-1 pl-1 pr-3 transition hover:border-[#1a56db]/30"
                >
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9]">
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL dinamic (Supabase / uploads)
                      <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-medium text-[#1a56db]">
                        {displayName.slice(0, 1).toUpperCase() || "?"}
                      </span>
                    )}
                  </span>
                  <span className="hidden min-w-0 truncate text-sm font-medium text-[#0f172a] xl:inline">{displayName}</span>
                </Link>

                <SignOutButton className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition hover:border-red-200 hover:text-red-600">
                  <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  <span className="sr-only">{tAuth("logout")}</span>
                </SignOutButton>
              </>
            ) : (
              <Link
                href={accountHref}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 text-sm font-medium text-[#334155] transition hover:border-[#1a56db]/30 hover:text-[#1a56db]"
              >
                <UserRound className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} aria-hidden />
                {t("connect")}
              </Link>
            )}

            <Link
              href={publishHref}
              className="inline-flex min-h-[40px] shrink-0 items-center rounded-xl bg-[#1a56db] px-4 text-sm font-medium text-white transition hover:bg-[#1648c0]"
            >
              {t("publish")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
