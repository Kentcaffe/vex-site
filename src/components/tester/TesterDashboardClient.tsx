"use client";

import type { ReactElement } from "react";
import type { BugRow } from "../../lib/tester-bugs";
import type { LeaderboardEntry } from "./dashboard/TesterRightRail";
import { TesterDashboardHome } from "./dashboard/TesterDashboardHome";

/**
 * Compatibilitate: vechiul dashboard monolit a fost înlocuit de
 * `TesterWorkspaceShell` + `TesterWorkspaceProvider` + `TesterDashboardHome`.
 * Dacă mai importezi acest simbol, datele `bugs` / `leaderboard` sunt ignorate — vin din context.
 */
export function TesterDashboardClient(_props: {
  bugs: BugRow[];
  leaderboard: LeaderboardEntry[];
}): ReactElement {
  return <TesterDashboardHome />;
}
