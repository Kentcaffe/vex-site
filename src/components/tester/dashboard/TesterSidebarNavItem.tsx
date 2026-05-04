"use client";

import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

const linkBaseDesktop =
  "group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500/50";
const inactiveDesktop =
  "text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white";
const activeDesktop =
  "border-emerald-500/40 bg-gradient-to-r from-violet-600/25 to-emerald-600/20 text-white shadow-[0_0_24px_-8px_rgba(16,185,129,0.45)]";

type DesktopProps = {
  variant: "desktop";
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  ariaLabel?: string;
};

type MobileProps = {
  variant: "mobile";
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  ariaLabel?: string;
};

type Props = DesktopProps | MobileProps;

export function TesterSidebarNavItem(props: Props) {
  const { href, label, icon: Icon, active, ariaLabel } = props;

  if (props.variant === "desktop") {
    return (
      <Link
        href={href}
        className={`${linkBaseDesktop} ${active ? activeDesktop : inactiveDesktop}`}
        aria-current={active ? "page" : undefined}
        aria-label={ariaLabel}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            active ? "bg-emerald-500/20 text-emerald-200" : "bg-white/[0.06] text-slate-300 group-hover:bg-violet-500/20 group-hover:text-violet-200"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        active ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100" : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
      }`}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}

type ChatLinkProps = {
  variant: "desktop" | "mobile";
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

export function TesterSidebarChatLink({ variant, href, label, icon: Icon, active }: ChatLinkProps) {
  if (variant === "desktop") {
    return (
      <Link
        href={href}
        className={`${linkBaseDesktop} ${active ? activeDesktop : inactiveDesktop}`}
        aria-current={active ? "page" : undefined}
        aria-label={label}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            active ? "bg-emerald-500/20 text-emerald-200" : "bg-white/[0.06] text-slate-300 group-hover:bg-violet-500/20 group-hover:text-violet-200"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        active ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100" : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
      }`}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}
