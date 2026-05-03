"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";

const QUICK_EMOJIS = ["👍", "🔥", "✅", "🐛", "💡", "🙏"];

type Props = {
  value: string;
  /** Client callbacks; sufix `Action` = convenție Next `ts(71007)` (nu sunt Server Actions). */
  onChangeAction: (v: string) => void;
  onSubmitAction: () => void;
  sending: boolean;
  disabled: boolean;
  placeholder: string;
  emojiPickerAria: string;
  attachAria: string;
};

export function TesterChatInput({
  value,
  onChangeAction,
  onSubmitAction,
  sending,
  disabled,
  placeholder,
  emojiPickerAria,
  attachAria,
}: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function insertEmoji(e: string) {
    onChangeAction(value + e);
    setEmojiOpen(false);
  }

  return (
    <div className="shrink-0 border-t border-white/[0.08] bg-[#070b14]/90 p-4 backdrop-blur-md sm:p-5">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <input ref={fileRef} type="file" className="hidden" multiple aria-hidden tabIndex={-1} />
        <button
          type="button"
          disabled={disabled}
          aria-label={attachAria}
          onClick={() => fileRef.current?.click()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white disabled:opacity-40"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="relative min-w-0 flex-1">
          {emojiOpen ? (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-[#12182a] p-2 shadow-xl">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-xl px-2 py-1 text-lg hover:bg-white/10"
                  onClick={() => insertEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          ) : null}
          <textarea
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(ev) => onChangeAction(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                if (!disabled && !sending && value.trim()) onSubmitAction();
              }
            }}
            placeholder={placeholder}
            className="max-h-40 min-h-[52px] w-full resize-y rounded-full border border-white/10 bg-black/50 px-5 py-3.5 pr-14 text-sm text-white placeholder:text-slate-500 outline-none ring-violet-500/0 transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
          />
          <button
            type="button"
            disabled={disabled}
            aria-label={emojiPickerAria}
            onClick={() => setEmojiOpen((o) => !o)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          disabled={disabled || sending || !value.trim()}
          onClick={onSubmitAction}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
