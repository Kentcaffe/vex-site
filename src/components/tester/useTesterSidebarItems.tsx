"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bug, FlaskConical, LayoutDashboard, Medal, Settings, Trophy } from "lucide-react";
import type { TesterSidebarItem } from "@/components/tester/dashboard/TesterSidebar";

export function useTesterSidebarItems(): TesterSidebarItem[] {
  const t = useTranslations("TesterDashboard.nav");
  return useMemo(
    () => [
      { id: "dash", href: "/tester", label: t("dashboard"), icon: LayoutDashboard },
      { id: "test", href: "/tester#report", label: t("test"), icon: FlaskConical },
      { id: "reports", href: "/tester#reports", label: t("reports"), icon: Bug },
      { id: "rewards", href: "/tester#rewards", label: t("rewards"), icon: Trophy },
      { id: "lb", href: "/tester#leaderboard", label: t("leaderboard"), icon: Medal },
      { id: "settings", href: "/cont", label: t("settings"), icon: Settings },
    ],
    [t],
  );
}
