"use client";

import type { ReactNode } from "react";

type Variant = "inbox" | "room";

type Props = {
  variant: Variant;
  list: ReactNode;
  main: ReactNode;
  side?: ReactNode;
};

export function ChatLayout({ variant, list, main, side }: Props) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-[#f8fafc] text-slate-800">
      <div
        className={
          variant === "room"
            ? "mx-auto grid max-w-[1400px] gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 md:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(240px,280px)]"
            : "mx-auto grid max-w-[1400px] gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]"
        }
      >
        <aside
          className={
            variant === "room"
              ? "hidden min-h-0 rounded-2xl border border-slate-200/90 bg-white shadow-sm md:block"
              : "min-h-0 rounded-2xl border border-slate-200/90 bg-white shadow-sm"
          }
        >
          {list}
        </aside>
        <section
          className={
            variant === "inbox"
              ? "hidden min-h-0 min-w-0 md:block"
              : "min-h-0 min-w-0"
          }
        >
          {main}
        </section>
        {side ? (
          <aside className="hidden min-h-0 rounded-2xl border border-slate-200/90 bg-white shadow-sm xl:block">
            {side}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
