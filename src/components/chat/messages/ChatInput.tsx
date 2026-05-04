"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, Send, Smile } from "lucide-react";
import { useTranslations } from "next-intl";

const QUICK = ["👍", "😊", "📍", "✅", "🙏"];

type Props = {
  draft: string;
  onDraftChangeAction: (v: string) => void;
  onSubmitAction: () => void;
  maxLength: number;
  disabled?: boolean;
  onAttachFilesAction?: (files: FileList) => void | Promise<void>;
  attachmentBusy?: boolean;
  attachmentError?: string | null;
};

export function ChatInput({
  draft,
  onDraftChangeAction,
  onSubmitAction,
  maxLength,
  disabled,
  onAttachFilesAction,
  attachmentBusy,
  attachmentError,
}: Props) {
  const t = useTranslations("Chat");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const remaining = maxLength - draft.length;
  const canAttach = Boolean(onAttachFilesAction) && !attachmentBusy && !disabled;

  return (
    <div className="border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            const list = e.target.files;
            e.target.value = "";
            if (list?.length && onAttachFilesAction) {
              void onAttachFilesAction(list);
            }
          }}
        />
        <button
          type="button"
          disabled={!canAttach}
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("attachAria")}
          title={onAttachFilesAction ? t("attachAria") : t("attachSoon")}
        >
          {attachmentBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
        </button>
        <div className="relative min-w-0 flex-1">
          {emojiOpen ? (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {QUICK.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-lg px-2 py-1 text-lg hover:bg-slate-100"
                  onClick={() => {
                    onDraftChangeAction(draft + e);
                    setEmojiOpen(false);
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          ) : null}
          <textarea
            value={draft}
            disabled={disabled}
            onChange={(e) => onDraftChangeAction(e.target.value)}
            maxLength={maxLength}
            rows={1}
            placeholder={t("placeholder")}
            className="max-h-36 min-h-[48px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-[15px] text-slate-900 outline-none ring-emerald-500/0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!disabled && draft.trim()) onSubmitAction();
              }
            }}
            aria-label={t("placeholder")}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setEmojiOpen((o) => !o)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-white"
            aria-label={t("emojiAria")}
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={onSubmitAction}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("send")}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-auto mt-1 flex max-w-3xl flex-col items-end gap-0.5 text-[11px] tabular-nums text-slate-400">
        {attachmentError ? (
          <span className="w-full text-left font-medium text-red-600" role="alert">
            {attachmentError}
          </span>
        ) : null}
        <span className={remaining < 120 ? "font-medium text-amber-600" : ""}>
          {remaining} {t("charsLeft")}
        </span>
      </div>
    </div>
  );
}
