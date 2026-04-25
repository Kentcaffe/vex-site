"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useActionState } from "react";
import { Bell, Cog, Eye, Shield, SlidersHorizontal, Sparkles, User } from "lucide-react";
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

const SECTIONS = ["profile", "security", "notifications", "preferences", "privacy", "account"] as const;
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
        { id: "privacy" as const, label: t("nav.privacy"), icon: Eye },
        { id: "account" as const, label: t("nav.account"), icon: Cog },
      ] as const,
    [t],
  );

  return (
    <div className="app-shell app-section">
      <header className="mb-8 overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 text-zinc-900 shadow-sm lg:mb-10 lg:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Premium account
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-zinc-600">{t("subtitle")}</p>
        <p className="mt-3 text-xs font-medium text-zinc-500">
          {new Date(user.createdAt).toLocaleDateString(uiLocale, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <nav className="sticky top-24 z-10 flex gap-1 overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`interactive-soft interactive-soft-mobile flex min-h-[44px] min-w-[9.5rem] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold lg:min-w-0 lg:w-full ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-950 ring-1 ring-emerald-200/90"
                      : "text-zinc-700 hover:bg-zinc-100/80"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div key={active} className="animate-account-section space-y-6 rounded-xl transition-all duration-300 ease-out">
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
