"use client";

import { useMemo, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  company: string;
};

type Props = {
  items: Testimonial[];
};

export function BusinessTestimonialsCarousel({ items }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const safeCount = useMemo(() => Math.max(items.length, 1), [items.length]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 12; // + gap-3
    if (step <= 0) return;
    const idx = Math.round(el.scrollLeft / step);
    setActive(Math.min(Math.max(idx, 0), safeCount - 1));
  }

  return (
    <>
      <div
        ref={listRef}
        onScroll={onScroll}
        className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-3 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <article
            key={item.company}
            className="min-w-[86%] snap-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:min-w-0"
          >
            <p className="text-sm leading-relaxed text-zinc-700">“{item.quote}”</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{item.company}</p>
          </article>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
        {items.map((item, idx) => (
          <span
            key={`${item.company}-dot`}
            className={`h-1.5 rounded-full transition-all ${
              idx === active ? "w-5 bg-orange-500" : "w-1.5 bg-zinc-300"
            }`}
          />
        ))}
      </div>
    </>
  );
}
