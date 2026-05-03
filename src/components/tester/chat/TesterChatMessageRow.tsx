"use client";

import { Trash2 } from "lucide-react";
import { initials, bubbleColor, formatChatTime } from "./tester-chat-utils";

export type ChatMessageModel = {
  id: string;
  user_id: string;
  user: string;
  text: string;
  created_at: string;
};

const REACTION_EMOJIS = ["👍", "🔥", "❤️", "😂", "✅"] as const;

type Props = {
  message: ChatMessageModel;
  mine: boolean;
  locale: string;
  badgeText: string;
  canDelete: boolean;
  /** Client callbacks; sufix `Action` = convenție Next `ts(71007)` (nu sunt Server Actions). */
  onDeleteAction?: (id: string) => void;
  reactionCounts: Record<string, number>;
  myReactionKeyAction: (messageId: string, emoji: string) => string;
  hasMyReactionAction: (key: string) => boolean;
  onToggleReactionAction: (messageId: string, emoji: string) => void;
  reactionAria: string;
  deleteAria?: string;
};

export function TesterChatMessageRow({
  message,
  mine,
  locale,
  badgeText,
  canDelete,
  onDeleteAction,
  reactionCounts,
  myReactionKeyAction,
  hasMyReactionAction,
  onToggleReactionAction,
  reactionAria,
  deleteAria,
}: Props) {
  const time = formatChatTime(message.created_at, locale);
  const avatarBg = bubbleColor(message.user_id || message.user);

  return (
    <div className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[min(92%,520px)] gap-3 ${mine ? "flex-row-reverse" : "flex-row"}`}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white shadow-lg ring-1 ring-white/10"
          style={{ backgroundColor: avatarBg }}
          aria-hidden
        >
          {initials(message.user)}
        </div>
        <div className={`min-w-0 space-y-1.5 ${mine ? "items-end text-right" : "items-start text-left"}`}>
          <div className={`flex flex-wrap items-center gap-2 ${mine ? "justify-end" : "justify-start"}`}>
            <span className="truncate text-sm font-semibold text-white">{message.user}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-200/90">
              {badgeText}
            </span>
            <time className="text-[11px] text-slate-500" dateTime={message.created_at}>
              {time}
            </time>
            {canDelete && onDeleteAction ? (
              <button
                type="button"
                onClick={() => onDeleteAction(message.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200 transition hover:bg-red-500/20"
                aria-label={deleteAria ?? reactionAria}
              >
                <Trash2 className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </div>
          <div
            className={`rounded-2xl border px-4 py-2.5 text-sm leading-relaxed shadow-md ${
              mine
                ? "border-emerald-500/30 bg-gradient-to-br from-emerald-600/35 to-emerald-900/40 text-emerald-50"
                : "border-white/10 bg-white/[0.06] text-slate-100 backdrop-blur-sm"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          <div className={`flex flex-wrap gap-1.5 ${mine ? "justify-end" : "justify-start"}`}>
            {REACTION_EMOJIS.map((emoji) => {
              const key = myReactionKeyAction(message.id, emoji);
              const active = hasMyReactionAction(key);
              const count = reactionCounts[emoji] ?? 0;
              return (
                <button
                  key={emoji}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${reactionAria} ${emoji}`}
                  onClick={() => onToggleReactionAction(message.id, emoji)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                    active
                      ? "border-violet-500/40 bg-violet-500/20 text-white"
                      : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 0 ? <span className="text-[10px] font-semibold text-slate-400">{count}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
