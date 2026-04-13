"use client";

import type { LucideIcon } from "lucide-react";

type Props = {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
};

export function IconField({ id, label, icon: Icon, error, hint, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          aria-hidden
        />
        {children}
      </div>
      {hint && !error ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-3.5 text-[15px] text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";
