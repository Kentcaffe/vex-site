import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { isStaff } from "@/lib/auth-roles";
import { getActiveListingCount } from "@/lib/listing-stats";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { UserRound } from "lucide-react";
import { ChatInboxLink } from "@/components/chat/ChatInboxLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";

const searchInputClass = "field-input h-12 pl-11 md:h-12";

export async function SiteHeader() {
  const session = await auth();
  const locale = await getLocale();
  const [t, tm, tf, listingCount, unreadNotifications] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Home.marketplace"),
    getTranslations("Footer"),
    getActiveListingCount(),
    session?.user?.id
      ? userNotification.count({ where: { userId: session.user.id, read: false } })
      : Promise.resolve(0),
  ]);

  const listingsHref = localizedHref(locale, "/anunturi");
  const accountHref = localizedHref(locale, "/cont");
  const publishHref = localizedHref(locale, "/publica");

  return (
    <header className="border-b border-zinc-200/80 bg-white md:sticky md:top-0 md:z-40 md:bg-white/90 md:backdrop-blur-md md:dark:border-zinc-800/80 md:dark:bg-zinc-950/90">
      <div className="hidden bg-emerald-600 px-4 py-1.5 text-center text-[11px] font-medium text-white/95 sm:text-xs md:block">
        {tm("banner")}
      </div>
      <div className="app-shell py-2.5 sm:py-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:surface-card-soft md:border-zinc-200/70 md:p-4 md:dark:border-zinc-700">
          <div className="md:hidden">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link
                href="/"
                className="block truncate text-xl font-black tracking-tight text-zinc-950"
                title={tf("tagline")}
              >
                {tf("siteName")}
              </Link>
              <details className="relative shrink-0">
                <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm [&::-webkit-details-marker]:hidden">
                  <UserRound className="h-5 w-5" aria-hidden />
                  <span className="sr-only">{t("account")}</span>
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
                  <Link
                    href={accountHref}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    {t("account")}
                  </Link>
                  <div className="px-3 py-2">
                    <LanguageSwitcher />
                  </div>
                  {session?.user && isStaff(session.user.role) ? (
                    <Link
                      href="/admin"
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      {t("admin")}
                    </Link>
                  ) : null}
                  {session?.user ? (
                    <div className="px-1 pt-1">
                      <SignOutButton className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50" />
                    </div>
                  ) : null}
                </div>
              </details>
            </div>

            <form action={listingsHref} method="get" className="mt-4 md:hidden">
              <div className="relative min-w-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden>
                  ⌕
                </span>
                <input
                  type="search"
                  name="search"
                  placeholder={t("searchPlaceholder")}
                  className={`${searchInputClass} border-zinc-200 bg-white text-zinc-900`}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="sr-only">
                {t("searchSubmit")}
              </button>
            </form>

            <Link href={publishHref} className="btn-primary mt-5 flex w-full justify-center">
              {t("addListingShort")}
            </Link>
          </div>

          <div className="mt-4 hidden min-w-0 flex-1 flex-col gap-4 md:flex">
            <div className="min-w-0 lg:max-w-[240px]">
              <Link
                href="/"
                className="block text-xl font-black tracking-tight text-zinc-950 sm:text-[1.7rem] md:dark:text-zinc-50"
                title={tf("tagline")}
              >
                {tf("siteName")}
              </Link>
              <p className="mt-1 text-[11px] text-zinc-500 md:dark:text-zinc-400">
                {tm("regionTag")} · {tm("activeListings", { count: listingCount })}
              </p>
            </div>
            <form action={listingsHref} method="get" className="flex min-w-0 flex-1 items-stretch gap-3">
              <Link href="/categorii" className="btn-secondary hidden gap-2 px-4 xl:inline-flex">
                <span className="text-base leading-none" aria-hidden>
                  ▦
                </span>
                {t("allCategories")}
              </Link>
              <div className="relative min-w-0 flex-1">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  aria-hidden
                >
                  ⌕
                </span>
                <input
                  type="search"
                  name="search"
                  placeholder={t("searchPlaceholder")}
                  className={searchInputClass}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn-primary min-w-[7.5rem]">
                {t("searchSubmit")}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href={publishHref} className="btn-primary min-h-[44px] rounded-xl px-4">
                {t("addListingShort")}
              </Link>
              <LanguageSwitcher />
              {session?.user ? (
                <>
                  <div className="hidden min-w-0 max-w-[200px] flex-col items-end text-right leading-tight xl:flex">
                    {session.user.name?.trim() ? (
                      <>
                        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                          {session.user.name.trim()}
                        </span>
                        {session.user.email ? (
                          <span
                            className="truncate text-[11px] text-zinc-500 dark:text-zinc-400"
                            title={session.user.email}
                          >
                            {session.user.email}
                          </span>
                        ) : null}
                      </>
                    ) : session.user.email ? (
                      <span
                        className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-50"
                        title={session.user.email}
                      >
                        {session.user.email}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">—</span>
                    )}
                  </div>
                  <Link href={accountHref} className="btn-secondary min-h-[36px] rounded-lg px-3 py-2 text-xs">
                    {t("account")}
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <Link href={accountHref} className="btn-secondary gap-2 px-4">
                  <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {t("account")}
                </Link>
              )}
            </div>
          </div>
        </div>

        <nav className="mt-3 hidden flex-wrap items-center gap-x-4 gap-y-2 px-1 text-sm dark:border-zinc-800/80 lg:flex">
          <Link
            href="/"
            className="text-zinc-600 lg:hover:text-emerald-700 dark:text-zinc-400 lg:dark:hover:text-emerald-400"
          >
            {t("home")}
          </Link>
          <Link
            href="/categorii"
            className="font-medium text-emerald-700 lg:hover:underline dark:text-emerald-400"
          >
            {t("categories")}
          </Link>
          <Link
            href="/anunturi"
            className="font-medium text-emerald-700 lg:hover:underline dark:text-emerald-400"
          >
            {t("listings")}
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/publica"
                className="text-zinc-600 lg:hover:text-zinc-900 dark:text-zinc-400 lg:dark:hover:text-zinc-100"
              >
                {t("publish")}
              </Link>
              <ChatInboxLink />
              <Link
                href="/cont/notificari"
                className="relative text-zinc-600 lg:hover:text-zinc-900 dark:text-zinc-400 lg:dark:hover:text-zinc-100"
              >
                {t("notifications")}
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/cont/favorite"
                className="text-zinc-600 lg:hover:text-zinc-900 dark:text-zinc-400 lg:dark:hover:text-zinc-100"
              >
                {t("favorites")}
              </Link>
              <Link
                href="/cont/raporteaza"
                className="hidden text-zinc-600 md:inline lg:hover:text-zinc-900 dark:text-zinc-400 lg:dark:hover:text-zinc-100"
              >
                {t("reportContent")}
              </Link>
            </>
          ) : null}
          {session?.user && isStaff(session.user.role) ? (
            <Link
              href="/admin"
              className="text-zinc-600 lg:hover:text-zinc-900 dark:text-zinc-400 lg:dark:hover:text-zinc-100"
            >
              {t("admin")}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
