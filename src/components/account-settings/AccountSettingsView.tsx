"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition, useActionState } from "react";
import { Bell, Cog, Eye, LayoutList, Shield, SlidersHorizontal, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
import type { SellerContactPrefs } from "@/lib/seller-contact-preferences";
import { SecuritySection } from "@/components/account-settings/sections/SecuritySection";
import { SettingsProfileHero } from "@/components/account-settings/SettingsProfileHero";
import { AccountSettingsRightSidebar } from "@/components/account-settings/AccountSettingsRightSidebar";

export type AccountSettingsViewProps = {
  locale: string;
  publicProfileUrl: string;
  user: {
    email: string;
    name: string | null;
    phone: string | null;
    city: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    isVerified: boolean;
    listingsCount: number;
    sellerContact: SellerContactPrefs;
  };
  hasPassword: boolean;
  preferences: UserPrefsShape;
};

const SECTIONS = ["profile", "security", "notifications", "preferences", "privacy", "account"] as const;
export type AccountSection = (typeof SECTIONS)[number];

function isSection(s: string | null): s is AccountSection {
  return s !== null && (SECTIONS as readonly string[]).includes(s);
}

const navBtnBase =
  "flex min-h-[44px] min-w-[9.5rem] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition duration-200 lg:min-w-0 lg:w-full";
const navInactive = "text-slate-700 hover:bg-slate-50 hover:shadow-sm";
const navActive =
  "bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-[#16a34a]/35 [box-shadow:0_1px_0_rgba(22,163,74,0.12)]";

export function AccountSettingsView({
  locale,
  publicProfileUrl,
  user,
  hasPassword,
  preferences: initialPrefs,
}: AccountSettingsViewProps) {
  const t = useTranslations("AccountSettings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const heroUser = useMemo(
    () => ({
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
      listingsCount: user.listingsCount,
    }),
    [user.avatarUrl, user.createdAt, user.email, user.isVerified, user.listingsCount, user.name],
  );

  return (
    <div className="motion-safe:animate-account-section w-full min-w-0 space-y-6 font-sans lg:space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{t("title")}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">{t("subtitle")}</p>
      </header>

      <SettingsProfileHero user={heroUser} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,260px)] lg:items-start lg:gap-8">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <nav
            aria-label={t("title")}
            className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_2px_20px_-8px_rgb(15_23_42/0.08)] [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`${navBtnBase} ${isActive ? navActive : navInactive}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#16a34a]" : "text-slate-500"}`} aria-hidden />
                  {label}
                </button>
              );
            })}
            <Link
              href="/cont/anunturi"
              className={`${navBtnBase} ${navInactive} motion-safe:transition-transform motion-safe:hover:scale-[1.01]`}
            >
              <LayoutList className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              {t("nav.listings")}
            </Link>
          </nav>
        </aside>

        <main
          className={`min-w-0 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_24px_-10px_rgb(15_23_42/0.1)] transition duration-300 motion-safe:hover:shadow-[0_8px_32px_-12px_rgb(15_23_42/0.12)] sm:p-6 lg:p-7`}
        >
          <div key={active} className="motion-safe:animate-account-section space-y-6">
            {active === "profile" ? (
              <ProfileSection locale={locale} user={user} publicProfileUrl={publicProfileUrl} />
            ) : null}

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
        </main>

        <div className="hidden min-w-0 lg:block">
          <AccountSettingsRightSidebar />
        </div>
      </div>

      <div className="lg:hidden">
        <AccountSettingsRightSidebar />
      </div>
    </div>
  );
}
