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

  return (
    <header className="border-b border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="bg-zinc-900 px-3 py-1.5 text-center text-[11px] text-zinc-200">
        {tm("banner")}
      </div>
      <div className="mx-auto max-w-[1200px] px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
          <div className="min-w-0 shrink-0 lg:max-w-[200px]">
            <Link href="/" className="block text-2xl font-black tracking-tight text-[#0b57d0] dark:text-blue-400" title={tf("tagline")}>
              {tf("siteName")}
            </Link>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {tm("regionTag")} · {tm("activeListings", { count: listingCount })}
            </p>
          </div>

          <form
            action={listingsHref}
            method="get"
            className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch"
          >
            <Link
              href="/categorii"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <span className="text-base leading-none" aria-hidden>
                ▦
              </span>
              {t("allCategories")}
            </Link>
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                name="search"
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-[#f3f4f6] py-2 pl-10 pr-3 text-sm text-zinc-900 shadow-inner outline-none ring-[#0b57d0]/20 placeholder:text-zinc-400 focus:border-[#0b57d0] focus:bg-white focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-[#0b57d0] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0842a0] dark:hover:bg-blue-600"
            >
              {t("searchSubmit")}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-end gap-2 lg:shrink-0">
            <Link
              href="/publica"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-400 px-4 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-amber-300 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400"
            >
              {t("addListingShort")}
            </Link>
            <LanguageSwitcher />
            {session?.user ? (
              <>
                <div className="hidden min-w-0 max-w-[200px] flex-col items-end text-right leading-tight sm:flex">
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
                <Link
                  href="/cont"
                  className="inline-flex h-9 items-center rounded-lg border border-zinc-300 px-2.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("account")}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/cont"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {t("account")}
              </Link>
            )}
          </div>
        </div>

        <nav className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800/80">
          <Link href="/" className="text-zinc-600 hover:text-[#0b57d0] dark:text-zinc-400 dark:hover:text-blue-400">
            {t("home")}
          </Link>
          <Link href="/categorii" className="font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
            {t("categories")}
          </Link>
          <Link href="/anunturi" className="font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
            {t("listings")}
          </Link>
          {session?.user ? (
            <>
              <Link href="/publica" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                {t("publish")}
              </Link>
              <ChatInboxLink />
              <Link
                href="/cont/notificari"
                className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("notifications")}
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                ) : null}
              </Link>
              <Link href="/cont/favorite" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                {t("favorites")}
              </Link>
              <Link
                href="/cont/raporteaza"
                className="hidden text-zinc-600 hover:text-zinc-900 md:inline dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("reportContent")}
              </Link>
            </>
          ) : null}
          {session?.user && isStaff(session.user.role) ? (
            <Link href="/admin" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("admin")}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
