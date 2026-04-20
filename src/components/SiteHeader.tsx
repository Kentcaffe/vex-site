import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { isStaff } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { userNotification } from "@/lib/prisma-delegates";
import { UserRound } from "lucide-react";
import { ChatInboxLink } from "@/components/chat/ChatInboxLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";

export async function SiteHeader() {
  const session = await auth();
  const locale = await getLocale();
  const [t, tm, tf, unreadNotifications] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Home.marketplace"),
    getTranslations("Footer"),
    session?.user?.id
      ? userNotification.count({ where: { userId: session.user.id, read: false } })
      : Promise.resolve(0),
  ]);

  const accountHref = localizedHref(locale, "/cont");
  const publishHref = localizedHref(locale, "/publica");

  return (
    <header className="static w-full max-w-[100vw] border-b border-[var(--mp-border)] bg-[var(--mp-page)] md:bg-[var(--mp-surface)]">
      <div className="hidden min-h-[2.75rem] items-center justify-center bg-gradient-to-r from-orange-100/90 to-amber-50 px-4 py-2 text-center text-[12px] font-medium leading-snug text-zinc-700 sm:text-[13px] md:flex">
        {tm("banner")}
      </div>
      <div className="app-shell py-3 sm:py-4">
        <div className="rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-3 shadow-[var(--mp-shadow)] sm:p-4">
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
              <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] text-[var(--mp-text-secondary)] shadow-sm [&::-webkit-details-marker]:hidden">
                <UserRound className="h-5 w-5" aria-hidden />
                <span className="sr-only">{t("account")}</span>
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-2 shadow-[var(--mp-shadow-lg)]">
                <Link
                  href={accountHref}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--mp-text)] hover:bg-[var(--mp-surface-muted)]"
                >
                  {t("account")}
                </Link>
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <LanguageSwitcher />
                </div>
                {session?.user && isStaff(session.user.role) ? (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--mp-text)] hover:bg-[var(--mp-surface-muted)]"
                  >
                    {t("admin")}
                  </Link>
                ) : null}
                {session?.user ? (
                  <div className="px-1 pt-1">
                    <SignOutButton className="w-full rounded-lg border border-[var(--mp-border)] px-3 py-2.5 text-left text-sm font-medium text-[var(--mp-text)] hover:bg-[var(--mp-surface-muted)]" />
                  </div>
                ) : null}
              </div>
            </details>
          </div>

          {/* Desktop */}
          <div className="mt-0 hidden flex-col gap-3 md:flex">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="inline-flex shrink-0 items-center" title={tf("tagline")}>
                <Image
                  src="/logo.png"
                  alt="VEX - anunțuri gratuite Moldova"
                  width={204}
                  height={68}
                  className="h-11 w-auto sm:h-12"
                  priority
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 lg:gap-3">
                <Link href="/categorii" className="btn-secondary hidden gap-2 px-4 xl:inline-flex">
                  <span className="text-base leading-none" aria-hidden>
                    ▦
                  </span>
                  {t("allCategories")}
                </Link>
                <Link href={publishHref} className="btn-primary min-h-[44px] rounded-xl px-4">
                  {t("addListingShort")}
                </Link>
                <LanguageSwitcher />
                {session?.user ? (
                  <>
                    <div className="hidden min-w-0 max-w-[200px] flex-col items-end text-right leading-tight xl:flex">
                      {session.user.name?.trim() ? (
                        <>
                          <span className="truncate text-xs font-semibold text-zinc-900">
                            {session.user.name.trim()}
                          </span>
                          {session.user.email ? (
                            <span
                              className="truncate text-[11px] text-zinc-500"
                              title={session.user.email}
                            >
                              {session.user.email}
                            </span>
                          ) : null}
                        </>
                      ) : session.user.email ? (
                        <span
                          className="truncate text-xs font-semibold text-zinc-900"
                          title={session.user.email}
                        >
                          {session.user.email}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </div>
                    <Link href={accountHref} className="btn-secondary min-h-[40px] rounded-lg px-3 py-2 text-xs">
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

            <nav className="hidden flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-3 text-sm lg:flex">
              <Link href="/" className="text-[var(--mp-text-muted)] transition hover:text-[var(--mp-primary)]">
                {t("home")}
              </Link>
              <Link href="/categorii" className="font-semibold text-orange-600 hover:underline">
                {t("categories")}
              </Link>
              <Link href="/anunturi" className="font-semibold text-orange-600 hover:underline">
                {t("listings")}
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/publica"
                    className="text-[var(--mp-text-secondary)] transition hover:text-[var(--mp-text)]"
                  >
                    {t("publish")}
                  </Link>
                  <ChatInboxLink />
                  <Link
                    href="/cont/notificari"
                    className="relative text-[var(--mp-text-muted)] transition hover:text-[var(--mp-text)]"
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
                    className="text-[var(--mp-text-muted)] transition hover:text-[var(--mp-text)]"
                  >
                    {t("favorites")}
                  </Link>
                  <Link
                    href="/cont/raporteaza"
                    className="hidden text-[var(--mp-text-muted)] transition hover:text-[var(--mp-text)] md:inline"
                  >
                    {t("reportContent")}
                  </Link>
                </>
              ) : null}
              {session?.user && isStaff(session.user.role) ? (
                <Link href="/admin" className="text-[var(--mp-text-muted)] transition hover:text-[var(--mp-text)]">
                  {t("admin")}
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
