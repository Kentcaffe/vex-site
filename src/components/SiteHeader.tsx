import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { isStaff } from "@/lib/auth-roles";
import { getActiveListingCount } from "@/lib/listing-stats";
import { userNotification } from "@/lib/prisma-delegates";
import { ChatInboxLink } from "@/components/chat/ChatInboxLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";

export async function SiteHeader() {
  const session = await auth();
  const [t, tm, tf, listingCount, unreadNotifications] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Home.marketplace"),
    getTranslations("Footer"),
    getActiveListingCount(),
    session?.user?.id
      ? userNotification.count({ where: { userId: session.user.id, read: false } })
      : Promise.resolve(0),
  ]);

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="bg-zinc-900 px-3 py-1.5 text-center text-[11px] text-zinc-200">
        {tm("banner")}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <Link href="/" className="block text-2xl font-black tracking-tight text-[#0b57d0] dark:text-blue-400" title={tf("tagline")}>
            {tf("siteName")}
          </Link>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {tm("regionTag")} · {tm("activeListings", { count: listingCount })}
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link href="/" className="hidden text-sm text-zinc-700 hover:text-zinc-900 sm:inline dark:text-zinc-300 dark:hover:text-white">
            {t("home")}
          </Link>
          <Link href="/categorii" className="text-sm font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
            {t("categories")}
          </Link>
          <Link href="/anunturi" className="text-sm font-medium text-[#0b57d0] hover:underline dark:text-blue-400">
            {t("listings")}
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/publica"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("publish")}
              </Link>
              <ChatInboxLink />
              <Link
                href="/cont/notificari"
                className="relative text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("favorites")}
              </Link>
              <Link
                href="/cont/raporteaza"
                className="hidden text-sm text-zinc-600 hover:text-zinc-900 md:inline dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("reportContent")}
              </Link>
            </>
          ) : null}
          {session?.user && isStaff(session.user.role) ? (
            <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              {t("admin")}
            </Link>
          ) : null}
          <LanguageSwitcher />
          {session?.user ? (
            <>
              <span className="hidden max-w-[120px] truncate text-[11px] text-zinc-500 lg:inline" title={session.user.email ?? ""}>
                {session.user.email}
              </span>
              <Link
                href="/cont"
                className="rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("account")}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/cont"
              className="rounded border border-zinc-400 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {t("login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
