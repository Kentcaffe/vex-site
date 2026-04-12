"use client";

import { useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export function ListingGallery({ images, title }: Props) {
  const [idx, setIdx] = useState(0);
  const safe = images.length > 0 ? images : [];
  const main = safe[idx] ?? safe[0];

  if (!main) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900">
        —
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt={title} className="aspect-[4/3] w-full object-cover" />
      </div>
      {safe.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {safe.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-16 w-20 overflow-hidden rounded-lg border-2 ${
                i === idx ? "border-emerald-600" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
