"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  Headphones,
  Heart,
  LayoutGrid,
  LogOut,
  MessageSquareText,
  Settings,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { UserBadges } from "@/components/business/UserBadges";
import { SignOutButton } from "@/components/SignOutButton";
import { SupportChatModal } from "@/components/support/SupportChatModal";
import { resolvePublicMediaUrl } from "@/lib/media-url";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
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
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
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
        className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.99] active:bg-zinc-50"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href!}
      className="flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 shadow-sm transition active:scale-[0.99] active:bg-zinc-50"
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

  return (
    <div className="app-shell app-section pb-4">
      <header className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-md ring-2 ring-orange-100">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL extern din profil
            <img src={avatarSrc} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600 text-lg font-bold text-white">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-zinc-900">{displayName}</h1>
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
      </header>

      <nav className="flex flex-col gap-2" aria-label={t("navAria")}>
        <HubRow href="/cont/anunturi" icon={LayoutGrid} label={t("myListings")} />
        <HubRow href="/cont/favorite" icon={Heart} label={t("saved")} />
        <HubRow icon={Headphones} label={t("support")} onClick={() => setSupportOpen(true)} />
        <HubRow href="/cont/feedback" icon={MessageSquareText} label={t("feedback")} />
        <HubRow href="/cont/setari" icon={Settings} label={t("settings")} />
        <HubRow href="/apply-business" icon={Settings} label="Aplicare cont firmă" />
      </nav>

      <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-1">
        <SignOutButton className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-red-700 transition hover:bg-red-100/80">
          <LogOut className="h-5 w-5" aria-hidden />
          {t("logout")}
        </SignOutButton>
      </div>

      <SupportChatModal open={supportOpen} onDismissAction={() => setSupportOpen(false)} />
    </div>
  );
}
