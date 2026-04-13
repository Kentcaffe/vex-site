"use client";

type Props = { children: React.ReactNode };

export function AuthDivider({ children }: Props) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
      </div>
      <div className="relative flex justify-center px-2">
        <span className="bg-white px-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
          {children}
        </span>
      </div>
    </div>
  );
}
