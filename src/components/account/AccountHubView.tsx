"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  ChevronRight,
  Crown,
  Headphones,
  Heart,
  LayoutGrid,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { UserBadges } from "@/components/business/UserBadges";
import { SignOutButton } from "@/components/SignOutButton";
import { SupportChatModal } from "@/components/support/SupportChatModal";
import { resolvePublicMediaUrl } from "@/lib/media-url";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role?: string | null;
    avatarUrl: string | null;
    accountType: string;
    businessStatus: string;
    companyName: string | null;
    companyLogo: string | null;
    isVerified: boolean;
  };
};

function HubRow({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href?: string;
  icon: typeof Heart;
  label: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-base font-semibold text-zinc-900">{label}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="interactive-soft interactive-soft-mobile flex w-full items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 text-left shadow-sm"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href!}
      className="interactive-soft interactive-soft-mobile flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 shadow-sm"
    >
      {inner}
    </Link>
  );
}

export function AccountHubView({ user }: Props) {
  const t = useTranslations("AccountHub");
  const [supportOpen, setSupportOpen] = useState(false);
  const avatarSrc = resolvePublicMediaUrl(user.avatarUrl);
  const companyLogo = resolvePublicMediaUrl(user.companyLogo);
  const displayName = user.name?.trim() || user.email.split("@")[0] || user.email;
  const roleValue = String(user.role ?? "").toUpperCase();
  const canAccessTester = canAccessTesterDashboard(user.role);
  const isTester = roleValue === "TESTER";

  return (
    <div className="app-shell app-section pb-4">
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" aria-hidden />
        <div className="relative flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-md ring-2 ring-emerald-100">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL extern din profil
              <img src={avatarSrc} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
              <Crown className="h-3.5 w-3.5" aria-hidden />
              Premium account
            </p>
            {isTester ? (
              <p className="ml-2 inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                {t("testerBadge")}
              </p>
            ) : null}
            <h1 className="mt-2 truncate text-xl font-bold tracking-tight text-zinc-900">{displayName}</h1>
            <p className="truncate text-sm text-zinc-500">{user.email}</p>
            <UserBadges user={user} className="mt-2" />
            {user.accountType === "business" && user.companyName ? (
              <div className="mt-2 flex items-center gap-2">
                {companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={companyLogo} alt={user.companyName} className="h-8 w-8 rounded-md object-cover" />
                ) : null}
                <Link href={`/firm/${user.id}`} className="truncate text-sm font-semibold text-blue-700 hover:underline">
                  {user.companyName}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        <div className="relative mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-white/90 px-3 py-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Cont securizat
            </p>
            <p className="mt-1 text-xs text-zinc-600">Datele contului sunt protejate și controlate din setări.</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white/90 px-3 py-2">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-orange-800">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Acces rapid
            </p>
            <p className="mt-1 text-xs text-zinc-600">Gestionezi anunțurile, favoritele și suportul dintr-un singur loc.</p>
          </div>
        </div>
      </header>

      <nav className="animate-account-section flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm" aria-label={t("navAria")}>
        <div className="[&>*]:animate-account-section">
          <HubRow href="/cont/anunturi" icon={LayoutGrid} label={t("myListings")} />
        </div>
        <div className="[&>*]:animate-account-section">
          <HubRow href="/cont/favorite" icon={Heart} label={t("saved")} />
        </div>
        {canAccessTester ? (
          <div className="[&>*]:animate-account-section">
            <HubRow href="/tester" icon={BadgeCheck} label={t("testerDashboard")} />
          </div>
        ) : null}
        <div className="[&>*]:animate-account-section">
          <HubRow icon={Headphones} label={t("support")} onClick={() => setSupportOpen(true)} />
        </div>
        <div className="[&>*]:animate-account-section">
          <HubRow href="/cont/feedback" icon={MessageSquareText} label={t("feedback")} />
        </div>
        <div className="[&>*]:animate-account-section">
          <HubRow href="/cont/setari" icon={Settings} label={t("settings")} />
        </div>
        {user.accountType === "business" ? null : (
          <div className="[&>*]:animate-account-section">
            <HubRow href="/apply-business" icon={Settings} label="Aplicare cont firmă" />
          </div>
        )}
      </nav>

      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/60 p-1 shadow-sm">
        <SignOutButton className="interactive-soft interactive-soft-mobile flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-red-700 hover:bg-red-100/80">
          <LogOut className="h-5 w-5" aria-hidden />
          {t("logout")}
        </SignOutButton>
      </div>

      <SupportChatModal open={supportOpen} onDismissAction={() => setSupportOpen(false)} />
    </div>
  );
}
