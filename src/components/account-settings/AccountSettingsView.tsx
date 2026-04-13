"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useActionState } from "react";
import { Bell, Cog, Eye, History, Shield, SlidersHorizontal, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  type ActionResult,
  changeAccountPassword,
  deleteUserAccount,
  logAccountActivityEvent,
  updateUserPreferences,
} from "@/app/actions/account-settings";
import { useToast } from "@/components/ui/SimpleToast";
import { routing } from "@/i18n/routing";
import type { UserPrefsShape } from "@/lib/user-preferences";
import { AccountSection } from "@/components/account-settings/sections/AccountSection";
import { ActivitySection } from "@/components/account-settings/sections/ActivitySection";
import { NotificationsSection } from "@/components/account-settings/sections/NotificationsSection";
import { PreferencesSection } from "@/components/account-settings/sections/PreferencesSection";
import { PrivacySection } from "@/components/account-settings/sections/PrivacySection";
import { ProfileSection } from "@/components/account-settings/sections/ProfileSection";
import { SecuritySection } from "@/components/account-settings/sections/SecuritySection";

export type AccountSettingsViewProps = {
  locale: string;
  user: {
    email: string;
    name: string | null;
    phone: string | null;
    city: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
  };
  hasPassword: boolean;
  preferences: UserPrefsShape;
};

const SECTIONS = ["profile", "security", "notifications", "preferences", "activity", "privacy", "account"] as const;
export type AccountSection = (typeof SECTIONS)[number];

function isSection(s: string | null): s is AccountSection {
  return s !== null && (SECTIONS as readonly string[]).includes(s);
}

export function AccountSettingsView({ locale, user, hasPassword, preferences: initialPrefs }: AccountSettingsViewProps) {
  const t = useTranslations("AccountSettings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uiLocale = useLocale();
  const { toast } = useToast();
  const visitLogged = useRef(false);

  const sectionParam = searchParams.get("section");
  const active: AccountSection = isSection(sectionParam) ? sectionParam : "profile";

  const setSection = useCallback(
    (s: AccountSection) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("section", s);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [prefs, setPrefs] = useState<UserPrefsShape>(initialPrefs);

  const [pwState, pwAction, pwPending] = useActionState(changeAccountPassword, undefined as ActionResult | undefined);
  const [delState, delAction, delPending] = useActionState(deleteUserAccount, undefined as ActionResult | undefined);
  const [, startRefresh] = useTransition();

  useEffect(() => {
    if (visitLogged.current) return;
    visitLogged.current = true;
    void logAccountActivityEvent("settings_visit");
  }, []);

  useEffect(() => {
    if (pwState?.ok) {
      toast("success", t("toast.passwordChanged"));
    } else if (pwState && !pwState.ok && pwState.error === "wrong_password") {
      toast("error", t("toast.wrongPassword"));
    } else if (pwState && !pwState.ok) {
      toast("error", t("toast.error"));
    }
  }, [pwState, t, toast]);

  useEffect(() => {
    if (delState?.ok) {
      toast("success", t("toast.deleted"));
      window.location.href = locale === routing.defaultLocale ? "/" : `/${locale}`;
    } else if (delState && !delState.ok) {
      toast("error", t("toast.error"));
    }
  }, [delState, locale, t, toast]);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "dark") {
      root.classList.add("dark");
    } else if (prefs.theme === "light") {
      root.classList.remove("dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [prefs.theme]);

  async function savePrefsPatch(patch: Partial<UserPrefsShape>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        locale,
        notifyEmail: next.notifyEmail,
        notifyPush: next.notifyPush,
        notifyMessages: next.notifyMessages,
        theme: next.theme,
        currency: next.currency,
        profileVisibility: next.profileVisibility,
        showEmailPublic: next.showEmailPublic,
        showPhonePublic: next.showPhonePublic,
        twoFactorEnabled: next.twoFactorEnabled,
      }),
    );
    const res = await updateUserPreferences(undefined, fd);
    if (res.ok) {
      toast("success", t("toast.saved"));
      startRefresh(() => {
        router.refresh();
      });
    } else {
      toast("error", t("toast.error"));
    }
  }

  const navItems = useMemo(
    () =>
      [
        { id: "profile" as const, label: t("nav.profile"), icon: User },
        { id: "security" as const, label: t("nav.security"), icon: Shield },
        { id: "notifications" as const, label: t("nav.notifications"), icon: Bell },
        { id: "preferences" as const, label: t("nav.preferences"), icon: SlidersHorizontal },
        { id: "activity" as const, label: t("nav.activity"), icon: History },
        { id: "privacy" as const, label: t("nav.privacy"), icon: Eye },
        { id: "account" as const, label: t("nav.account"), icon: Cog },
      ] as const,
    [t],
  );

  const memberSince = useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString(uiLocale, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return user.createdAt;
    }
  }, [user.createdAt, uiLocale]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-8 lg:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <nav className="sticky top-20 z-10 flex gap-1 overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white/70 p-2 shadow-sm backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] sm:top-24 lg:flex-col lg:overflow-visible dark:border-zinc-800/80 dark:bg-zinc-900/70 [&::-webkit-scrollbar]:hidden">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`flex min-w-[9.5rem] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:min-w-0 lg:w-full ${
                    isActive
                      ? "bg-[#0b57d0]/10 text-[#0b57d0] dark:bg-blue-500/15 dark:text-blue-300"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div key={active} className="animate-account-section space-y-6 transition-all duration-300 ease-out">
            {active === "profile" ? <ProfileSection locale={locale} user={user} /> : null}

            {active === "security" ? (
              <SecuritySection
                locale={locale}
                hasPassword={hasPassword}
                prefs={prefs}
                savePrefsPatch={savePrefsPatch}
                pwAction={pwAction}
                pwPending={pwPending}
              />
            ) : null}

            {active === "notifications" ? (
              <NotificationsSection prefs={prefs} setPrefs={setPrefs} savePrefsPatch={savePrefsPatch} />
            ) : null}

            {active === "preferences" ? (
              <PreferencesSection prefs={prefs} setPrefs={setPrefs} savePrefsPatch={savePrefsPatch} />
            ) : null}

            {active === "activity" ? <ActivitySection memberSince={memberSince} activityLog={prefs.activityLog} /> : null}

            {active === "privacy" ? (
              <PrivacySection prefs={prefs} setPrefs={setPrefs} savePrefsPatch={savePrefsPatch} />
            ) : null}

            {active === "account" ? <AccountSection locale={locale} delAction={delAction} delPending={delPending} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
