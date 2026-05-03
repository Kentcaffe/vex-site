"use client";

import { Pin } from "lucide-react";

type Props = {
  title: string;
  body: string;
};

export function TesterChatPinnedBar({ title, body }: Props) {
  return (
    <div className="shrink-0 border-b border-violet-500/20 bg-gradient-to-r from-violet-950/50 to-indigo-950/40 px-4 py-3 sm:px-5">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/25 text-violet-200">
          <Pin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300/90">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">{body}</p>
        </div>
      </div>
    </div>
  );
}
