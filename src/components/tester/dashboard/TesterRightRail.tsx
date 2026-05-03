"use client";

import type { ReactNode } from "react";
import { BookOpen, Sparkles, Trophy } from "lucide-react";

export type LeaderboardEntry = {
  user_name: string;
  accepted_count: number;
  total_reward: number;
};

type Props = {
  guideTitle: string;
  guideSteps: string[];
  statsTitle: string;
  statTotalLabel: string;
  statOpenLabel: string;
  statAcceptedLabel: string;
  statRewardsLabel: string;
  total: number;
  open: number;
  accepted: number;
  reward: number;
  lbTitle: string;
  lbEmpty: string;
  lbAccepted: string;
  leaderboardFootnote: string;
  leaderboard: LeaderboardEntry[];
};

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-lg shadow-black/30 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function TesterRightRail({
  guideTitle,
  guideSteps,
  statsTitle,
  statTotalLabel,
  statOpenLabel,
  statAcceptedLabel,
  statRewardsLabel,
  total,
  open,
  accepted,
  reward,
  lbTitle,
  lbEmpty,
  lbAccepted,
  leaderboardFootnote,
  leaderboard,
}: Props) {
  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24">
      <div id="rewards">
        <GlassCard>
        <div className="flex items-center gap-2 text-violet-200">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{statsTitle}</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{statTotalLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">{total}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/80">{statOpenLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-100">{open}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/80">{statAcceptedLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-100">{accepted}</p>
          </div>
          <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-200/80">{statRewardsLabel}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-fuchsia-100">
              {reward} <span className="text-sm font-semibold">lei</span>
            </p>
          </div>
        </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 text-sky-200">
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{guideTitle}</h2>
        </div>
        <ol className="mt-4 space-y-3 text-sm leading-snug text-slate-300">
          {guideSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/25 text-xs font-bold text-violet-200">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </GlassCard>

      <div id="leaderboard">
        <GlassCard>
        <div className="flex items-center gap-2 text-amber-200">
          <Trophy className="h-4 w-4 shrink-0" aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{lbTitle}</h2>
        </div>
        {leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{lbEmpty}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {leaderboard.map((row, idx) => (
              <li
                key={`${row.user_name}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{row.user_name}</p>
                  <p className="text-xs text-slate-500">
                    {lbAccepted}: <span className="text-emerald-300/90">{row.accepted_count}</span>
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-fuchsia-500/15 px-2 py-1 text-xs font-semibold text-fuchsia-200">
                  {row.total_reward} lei
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[10px] leading-relaxed text-slate-600">{leaderboardFootnote}</p>
        </GlassCard>
      </div>
    </div>
  );
}
