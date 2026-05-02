import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Bell, Heart, LogOut, Plus, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { canAccessTesterDashboard, isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { ChatInboxLink } from "@/components/chat/ChatInboxLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { HeaderNavSearch } from "@/components/layout/HeaderNavSearch";
import { resolvePublicMediaUrl } from "@/lib/media-url";

export async function SiteHeader() {
  const session = await auth();
  const locale = await getLocale();
  const [t, tm, tf, tAuth, unreadNotifications] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Home.marketplace"),
    getTranslations("Footer"),
    getTranslations("Auth"),
    session?.user?.id
      ? userNotification.count({ where: { userId: session.user.id, read: false } })
      : Promise.resolve(0),
  ]);

  const accountHref = localizedHref(locale, "/cont");
  const publishHref = localizedHref(locale, "/publica");
  const anunturiHref = localizedHref(locale, "/anunturi");
  const notificariHref = localizedHref(locale, "/cont/notificari");
  const favoriteHref = localizedHref(locale, "/cont/favorite");
  const canAccessTester = session?.user?.role ? canAccessTesterDashboard(session.user.role) : false;
  const avatarSrc = session?.user?.image ? resolvePublicMediaUrl(session.user.image) : null;
  const displayName = session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-[100] w-full max-w-[100vw] border-b border-zinc-100/90 bg-white shadow-[0_2px_20px_-4px_rgba(15,23,42,0.06)]">
      <div className="hidden min-h-[2.5rem] items-center justify-center bg-gradient-to-r from-emerald-50/95 via-teal-50/80 to-zinc-50/90 px-4 py-1.5 text-center text-[12px] font-medium leading-snug text-zinc-700 sm:text-[13px] md:flex">
        {tm("banner")}
      </div>

      <div className="app-shell py-2.5 sm:py-3">
        {/* Mobile */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Link href="/" className="inline-flex min-w-0 items-center" title={tf("tagline")}>
            <Image
              src="/logo.png"
              alt="VEX - anunțuri gratuite Moldova"
              width={168}
              height={56}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <details className="relative shrink-0">
            <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-50 text-zinc-600 shadow-sm [&::-webkit-details-marker]:hidden">
              <UserRound className="h-5 w-5" aria-hidden />
              <span className="sr-only">{t("account")}</span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-lg">
              <Link
                href={accountHref}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                {t("account")}
              </Link>
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <LanguageSwitcher />
              </div>
              {canAccessTester ? (
                <Link href="/tester" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50">
                  {t("tester")}
                </Link>
              ) : null}
              {session?.user && isStaff(session.user.role) ? (
                <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50">
                  {t("admin")}
                </Link>
              ) : null}
              {session?.user ? (
                <div className="px-1 pt-1">
                  <SignOutButton className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50" />
                </div>
              ) : null}
            </div>
          </details>
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-0 md:flex">
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <Link href="/" className="inline-flex shrink-0 items-center" title={tf("tagline")}>
              <Image
                src="/logo.png"
                alt="VEX - anunțuri gratuite Moldova"
                width={204}
                height={68}
                className="h-10 w-auto sm:h-11"
                priority
              />
            </Link>

            <div className="mx-auto flex min-w-0 max-w-xl flex-1 justify-center px-1 lg:px-4">
              <HeaderNavSearch action={anunturiHref} placeholder={t("headerSearchPlaceholder")} />
            </div>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-2 lg:gap-2.5">
              <Link
                href={publishHref}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16a34a] hover:shadow-md"
              >
                <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                {t("addListingShort")}
              </Link>

              <LanguageSwitcher />

              {session?.user ? (
                <>
                  <ChatInboxLink variant="icon" />
                  <Link
                    href={notificariHref}
                    className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition hover:border-[#22c55e]/40 hover:bg-emerald-50/80 hover:text-[#16a34a]"
                    aria-label={t("notifications")}
                  >
                    <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
                    {unreadNotifications > 0 ? (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#22c55e] px-0.5 text-[9px] font-bold text-white ring-2 ring-white">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    href={favoriteHref}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-600 shadow-sm transition hover:border-[#22c55e]/40 hover:bg-emerald-50/80 hover:text-[#16a34a]"
                    aria-label={t("favorites")}
                  >
                    <Heart className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </Link>

                  <div className="mx-1 hidden h-8 w-px bg-zinc-200 lg:block" aria-hidden />

                  <Link
                    href={accountHref}
                    className="flex max-w-[200px] min-w-0 items-center gap-2 rounded-full border border-zinc-200/90 bg-zinc-50/80 py-1 pl-1 pr-3 shadow-sm transition hover:border-emerald-200/80 hover:bg-white"
                  >
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-white">
                      {avatarSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL dinamic (Supabase / uploads)
                        <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-emerald-800">
                          {displayName.slice(0, 1).toUpperCase() || "?"}
                        </span>
                      )}
                    </span>
                    <span className="hidden min-w-0 truncate text-sm font-semibold text-zinc-900 xl:inline">{displayName}</span>
                  </Link>

                  <SignOutButton className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
                    <span className="sr-only">{tAuth("logout")}</span>
                  </SignOutButton>
                </>
              ) : (
                <Link
                  href={accountHref}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-zinc-200/90 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-white"
                >
                  <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {t("account")}
                </Link>
              )}
            </div>
          </div>

          <nav className="mt-2.5 hidden flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-zinc-100 pt-2.5 text-sm lg:flex">
            <Link href="/" className="font-medium text-zinc-500 transition hover:text-[#22c55e]">
              {t("home")}
            </Link>
            <Link href="/categorii" className="font-semibold text-[#16a34a] hover:underline">
              {t("categories")}
            </Link>
            <Link href="/anunturi" className="font-semibold text-[#16a34a] hover:underline">
              {t("listings")}
            </Link>
            {session?.user ? (
              <>
                <Link href="/publica" className="font-medium text-zinc-500 transition hover:text-[#22c55e]">
                  {t("publish")}
                </Link>
                <Link
                  href="/cont/raporteaza"
                  className="hidden font-medium text-zinc-500 transition hover:text-[#22c55e] xl:inline"
                >
                  {t("reportContent")}
                </Link>
              </>
            ) : null}
            {canAccessTester ? (
              <Link href="/tester" className="font-medium text-zinc-500 transition hover:text-[#22c55e]">
                {t("tester")}
              </Link>
            ) : null}
            {session?.user && isStaff(session.user.role) ? (
              <Link href="/admin" className="font-medium text-zinc-500 transition hover:text-[#22c55e]">
                {t("admin")}
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
