"use client";

import type { ReactNode } from "react";
import { BookOpen, BarChart3, Users } from "lucide-react";

type OnlineUser = { id: string; name: string };

type Props = {
  guideTitle: string;
  steps: [string, string, string, string, string];
  onlineTitle: string;
  onlineEmpty: string;
  onlineUsers: OnlineUser[];
  statsTitle: string;
  statMessages: string;
  statBugs: string;
  statReporters: string;
  statMessagesValue: number;
  statBugsValue: number;
  statReportersValue: number;
};

function PanelCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-lg shadow-black/20 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function TesterChatRightPanel({
  guideTitle,
  steps,
  onlineTitle,
  onlineEmpty,
  onlineUsers,
  statsTitle,
  statMessages,
  statBugs,
  statReporters,
  statMessagesValue,
  statBugsValue,
  statReportersValue,
}: Props) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-white/[0.08] bg-[#070b14]/80 p-4 backdrop-blur-xl xl:flex">
      <PanelCard icon={BookOpen} title={guideTitle}>
        <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-slate-300">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </PanelCard>

      <PanelCard icon={Users} title={onlineTitle}>
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-slate-500">{onlineEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {onlineUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-2 py-2">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-indigo-700/40 text-[10px] font-bold text-white">
                  {u.name.slice(0, 2).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070b14] bg-emerald-400" title="online" />
                </span>
                <span className="min-w-0 truncate text-xs font-medium text-slate-200">{u.name}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      <PanelCard icon={BarChart3} title={statsTitle}>
        <dl className="space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
            <dt className="text-slate-400">{statMessages}</dt>
            <dd className="font-mono text-sm font-bold text-emerald-300">{statMessagesValue}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
            <dt className="text-slate-400">{statBugs}</dt>
            <dd className="font-mono text-sm font-bold text-violet-300">{statBugsValue}</dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
            <dt className="text-slate-400">{statReporters}</dt>
            <dd className="font-mono text-sm font-bold text-amber-300">{statReportersValue}</dd>
          </div>
        </dl>
      </PanelCard>
    </aside>
  );
}
