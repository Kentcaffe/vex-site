import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatInboxList } from "@/components/chat/ChatInboxList";
import { ChatServerError } from "@/components/chat/ChatServerError";
import { getLastRoomMessage } from "@/lib/chat-realtime-store";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function ChatInboxPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  let items: {
    roomId: string;
    listingTitle: string;
    otherUserName: string;
    otherUserAvatarUrl: string | null;
    lastMessageBody: string | null;
    lastMessageAt: string | null;
    unread: boolean;
  }[] = [];

  try {
    const rooms = await prisma.chatRoom.findMany({
      where: { OR: [{ buyerId: userId }, { listing: { userId } }] },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        readStates: { where: { userId }, select: { lastReadAt: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const roomList = Array.isArray(rooms) ? rooms : [];

    items = await Promise.all(
      roomList.map(async (r) => {
        let last: Awaited<ReturnType<typeof getLastRoomMessage>> = null;
        try {
          last = await getLastRoomMessage(r.id);
        } catch {
          last = null;
        }
        const seller = r.listing.user;
        const isBuyer = r.buyerId === userId;
        const otherName = isBuyer ? seller.name ?? seller.email ?? "" : r.buyer.name ?? r.buyer.email ?? "";
        const otherAvatarRaw = isBuyer ? seller.avatarUrl ?? null : r.buyer.avatarUrl ?? null;
        const lastReadAt = r.readStates[0]?.lastReadAt;
        const unread = Boolean(
          last &&
            last.receiverId === userId &&
            (!lastReadAt || last.createdAt.getTime() > lastReadAt.getTime()),
        );
        return {
          roomId: r.id,
          listingTitle: r.listing.title,
          otherUserName: otherName,
          otherUserAvatarUrl: resolvePublicMediaUrl(otherAvatarRaw),
          lastMessageBody: last?.content ?? null,
          lastMessageAt: last?.createdAt.toISOString() ?? null,
          unread,
        };
      }),
    );
  } catch (e) {
    console.error("[chat/inbox]", e);
    return <ChatServerError />;
  }

  const t = await getTranslations("Chat");
  return (
    <div className="app-shell app-section max-w-4xl w-full min-w-0">
      <div className="border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("inboxTitle")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("inboxSubtitle")}</p>
      </div>
      <ChatInboxList items={items} />
    </div>
  );
}
