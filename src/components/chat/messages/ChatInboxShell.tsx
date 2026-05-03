"use client";

import { useTranslations } from "next-intl";
import { ChatLayout } from "./ChatLayout";
import { ConversationList, type InboxItem } from "./ConversationList";

type Props = {
  items: InboxItem[];
};

export function ChatInboxShell({ items }: Props) {
  const t = useTranslations("Chat");
  return (
    <ChatLayout
      variant="inbox"
      list={<ConversationList items={items} />}
      main={
        <div className="hidden min-h-[min(70vh,520px)] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm md:flex">
          <div className="mx-auto max-w-md">
            <p className="text-lg font-bold text-slate-900">{t("selectConversationTitle")}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("selectConversationHint")}</p>
          </div>
        </div>
      }
    />
  );
}
