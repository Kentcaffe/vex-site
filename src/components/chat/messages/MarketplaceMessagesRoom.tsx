"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { MoreHorizontal, Phone } from "lucide-react";
import { ChatLayout } from "./ChatLayout";
import { ChatInput } from "./ChatInput";
import { ChatListingBar } from "./ChatListingBar";
import { ChatMessages } from "./ChatMessages";
import { ConversationList, type InboxItem } from "./ConversationList";
import { UserInfoPanel } from "./UserInfoPanel";
import { useMarketplaceChatRoom } from "./useMarketplaceChatRoom";
import type { ChatBootstrap } from "./chat-types";

type Props = {
  bootstrap: ChatBootstrap;
  currentUserId: string;
  inboxItems: InboxItem[];
};

export function MarketplaceMessagesRoom({ bootstrap, currentUserId, inboxItems }: Props) {
  const t = useTranslations("Chat");
  const hook = useMarketplaceChatRoom(bootstrap, currentUserId);

  const main = (
    <div className="flex max-md:min-h-[min(100dvh,720px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm md:min-h-[560px]">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
        <Link
          href="/chat"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
          aria-label={t("backToInbox")}
        >
          <span className="text-lg" aria-hidden>
            ←
          </span>
        </Link>
        <ChatAvatar url={bootstrap.otherUserAvatarUrl} name={bootstrap.otherUserName} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-slate-900">{bootstrap.otherUserName}</p>
          <p className="text-xs text-slate-500">
            {hook.connected ? t("userOnline") : t("userOffline")}
          </p>
        </div>
        <button
          type="button"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 sm:flex"
          aria-label={t("callAria")}
          title={t("attachSoon")}
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label={t("moreAria")}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <ChatListingBar listing={bootstrap.listing} />

      <ChatMessages
        messages={hook.messages}
        currentUserId={currentUserId}
        otherUserName={bootstrap.otherUserName}
        otherUserAvatarUrl={bootstrap.otherUserAvatarUrl}
        myAvatarUrl={bootstrap.myAvatarUrl}
        scrollRef={hook.scrollRef}
        bottomRef={hook.bottomRef}
        onScrollAction={hook.updateNearBottom}
        showNewMessagesBanner={hook.showNewMessagesBanner}
        onJumpToLatestAction={hook.scrollToLatest}
      />

      {hook.lastOwn && hook.seenOnLastOwn ? (
        <p className="shrink-0 border-t border-slate-100 px-4 py-1 text-center text-[11px] text-slate-400">{t("seen")}</p>
      ) : null}

      <div className="shrink-0 max-md:fixed max-md:inset-x-0 max-md:bottom-[var(--mobile-nav-reserve)] max-md:z-40 max-md:shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:static">
        <ChatInput
          draft={hook.draft}
          onDraftChangeAction={hook.setDraft}
          onSubmitAction={() => void hook.send()}
          maxLength={bootstrap.maxBodyLength}
        />
      </div>
      <div className="shrink-0 md:hidden" style={{ minHeight: "calc(var(--chat-composer-stack) + 2.25rem)" }} aria-hidden />
    </div>
  );

  return (
    <ChatLayout
      variant="room"
      list={<ConversationList items={inboxItems} />}
      main={main}
      side={<UserInfoPanel bootstrap={bootstrap} />}
    />
  );
}
