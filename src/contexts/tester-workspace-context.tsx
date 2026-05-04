"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LeaderboardEntry } from "@/components/tester/dashboard/TesterRightRail";
import type { BugRow } from "@/lib/tester-bugs";

type TesterWorkspaceValue = {
  bugs: BugRow[];
  leaderboard: LeaderboardEntry[];
};

const TesterWorkspaceContext = createContext<TesterWorkspaceValue | null>(null);

export function TesterWorkspaceProvider({
  bugs,
  leaderboard,
  children,
}: {
  bugs: BugRow[];
  leaderboard: LeaderboardEntry[];
  children: ReactNode;
}) {
  const [b, setB] = useState(bugs);
  const [l, setL] = useState(leaderboard);
  useEffect(() => {
    setB(bugs);
  }, [bugs]);
  useEffect(() => {
    setL(leaderboard);
  }, [leaderboard]);
  const value = useMemo(() => ({ bugs: b, leaderboard: l }), [b, l]);
  return <TesterWorkspaceContext.Provider value={value}>{children}</TesterWorkspaceContext.Provider>;
}

export function useTesterWorkspace(): TesterWorkspaceValue {
  const v = useContext(TesterWorkspaceContext);
  if (!v) {
    throw new Error("useTesterWorkspace must be used inside TesterWorkspaceProvider");
  }
  return v;
}
