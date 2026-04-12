import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { isStaff } from "@/lib/auth-roles";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";

export async function SiteHeader() {
  const session = await auth();
  const t = await getTranslations("Nav");

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-zinc-900 dark:text-zinc-50">
            {t("home")}
          </Link>
          <Link href="/anunturi" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            {t("listings")}
          </Link>
          {session?.user ? (
            <Link
              href="/publica"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("publish")}
            </Link>
          ) : null}
          {session?.user && isStaff(session.user.role) ? (
            <Link
              href="/admin"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("admin")}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline" title={session.user.email ?? ""}>
                {session.user.email}
              </span>
              <Link
                href="/cont"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("account")}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/cont"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
