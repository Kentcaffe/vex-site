import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { isStaff } from "@/lib/auth-roles";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Anunțuri
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 sm:flex">
          <Link href="/" className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("home")}
          </Link>
          <Link href="/anunturi" className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("browse")}
          </Link>
          <Link href="/publica" className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("post")}
          </Link>
          <Link href="/cont" className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("account")}
          </Link>
          {session?.user?.email && isStaff(session.user.role) ? (
            <Link href="/admin" className="transition hover:text-zinc-900 dark:hover:text-zinc-100">
              {t("admin")}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {session?.user?.email ? (
            <>
              <span className="hidden max-w-[160px] truncate text-xs text-zinc-500 sm:inline" title={session.user.email}>
                {session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : null}
          <span className="hidden text-xs text-zinc-500 sm:inline">{t("language")}</span>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
