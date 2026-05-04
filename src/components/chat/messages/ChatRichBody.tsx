"use client";

import { parseChatBodyToParts } from "@/lib/chat-attachment-markdown";

type Variant = "marketplaceMine" | "marketplaceOther" | "supportSystem" | "supportUser" | "supportStaff" | "testerMine" | "testerOther";

const textClass: Record<Variant, string> = {
  marketplaceMine: "text-white",
  marketplaceOther: "text-slate-800",
  supportSystem: "text-zinc-600 dark:text-zinc-300",
  supportUser: "text-zinc-800 dark:text-zinc-100",
  supportStaff: "text-white",
  testerMine: "text-emerald-50",
  testerOther: "text-slate-100",
};

export function ChatRichBody({ body, variant }: { body: string; variant: Variant }) {
  const parts = parseChatBodyToParts(body);
  const tc = textClass[variant];

  if (parts.length === 0) {
    return <p className={`whitespace-pre-wrap break-words ${tc}`}>{body}</p>;
  }

  return (
    <div className={`space-y-2 ${tc}`}>
      {parts.map((p, i) => {
        if (p.type === "text") {
          if (!p.text.trim()) {
            return null;
          }
          return (
            <p key={i} className="whitespace-pre-wrap break-words">
              {p.text}
            </p>
          );
        }
        return (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-full overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL-uri interne validate; fără domeniu extern stabil */}
            <img src={p.url} alt={p.alt} className="max-h-56 w-full object-contain" loading="lazy" />
          </a>
        );
      })}
    </div>
  );
}
