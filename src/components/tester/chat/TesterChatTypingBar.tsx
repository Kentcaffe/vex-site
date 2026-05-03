"use client";

import { Loader2 } from "lucide-react";

type Props = {
  label: string | null;
};

export function TesterChatTypingBar({ label }: Props) {
  if (!label) {
    return null;
  }
  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-black/20 px-4 py-2 text-xs text-slate-400 sm:px-5">
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" aria-hidden />
        <span className="text-slate-300">{label}</span>
      </span>
    </div>
  );
}
