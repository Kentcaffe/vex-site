import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatRoomView, type ChatBootstrap } from "@/components/chat/ChatRoomView";
import { ChatServerError } from "@/components/chat/ChatServerError";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { listRoomMessages } from "@/lib/chat-realtime-store";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { localizedHref } from "@/lib/paths";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string; roomId: string }> };

export default async function ChatRoomPage({ params }: Props) {
  const { locale, roomId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  try {
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (!me) {
      redirect(localizedHref(locale, "/cont"));
    }

    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        AND: [
          { OR: [{ buyerId: userId }, { listing: { userId } }] },
          { listing: listingWhereActive() },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        readStates: true,
      },
    });

    if (!room) {
      notFound();
    }

    const messages = await listRoomMessages(room.id, 200);
    const messageRows = Array.isArray(messages) ? messages : [];

    const seller = room.listing.user;
    const isBuyer = userId === room.buyerId;
    const otherName = isBuyer ? seller.name ?? seller.email ?? "" : room.buyer.name ?? room.buyer.email ?? "";
    const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
    const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);

    const bootstrap: ChatBootstrap = {
      roomId: room.id,
      listing: { id: room.listing.id, title: room.listing.title },
      seller: {
        id: seller.id,
        name: seller.name ?? seller.email ?? "",
        avatarUrl: resolvePublicMediaUrl(seller.avatarUrl ?? null),
      },
      buyer: {
        id: room.buyer.id,
        name: room.buyer.name ?? room.buyer.email ?? "",
        avatarUrl: resolvePublicMediaUrl(room.buyer.avatarUrl ?? null),
      },
      meIsBuyer: isBuyer,
      otherUserName: otherName,
      otherUserAvatarUrl: resolvePublicMediaUrl(
        isBuyer ? seller.avatarUrl ?? null : room.buyer.avatarUrl ?? null,
      ),
      myAvatarUrl: resolvePublicMediaUrl(me.avatarUrl ?? null),
      messages: messageRows.map((m: { id: string; senderId: string; content: string; createdAt: Date }) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      otherLastReadAt: readByOther?.lastReadAt.toISOString() ?? null,
      myLastReadAt: myRead?.lastReadAt.toISOString() ?? null,
      maxBodyLength: CHAT_MESSAGE_MAX,
    };

    return (
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-0 pt-2 sm:mx-auto sm:max-w-3xl sm:px-6 sm:py-6">
        <ChatRoomView key={room.id} bootstrap={bootstrap} currentUserId={userId} />
      </div>
    );
  } catch (e) {
    console.error("[chat/room]", e);
    return <ChatServerError />;
  }
}
