import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatRoomView, type ChatBootstrap } from "@/components/chat/ChatRoomView";
import { ChatServerError } from "@/components/chat/ChatServerError";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { getChatInboxItemsForUser } from "@/lib/chat-inbox-server";
import { getChatOtherProfileHref } from "@/lib/chat-other-profile-href";
import { listRoomMessages } from "@/lib/chat-realtime-store";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { localizedHref } from "@/lib/paths";
import { publicDisplayName } from "@/lib/public-privacy";
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
  let bootstrap: ChatBootstrap | null = null;
  let roomIdForKey = "";
  let inboxItems: Awaited<ReturnType<typeof getChatInboxItemsForUser>> = [];

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
            price: true,
            priceCurrency: true,
            city: true,
            condition: true,
            images: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        readStates: true,
      },
    });

    if (!room) {
      notFound();
    }

    const [messages, inbox, otherProfileHref] = await Promise.all([
      listRoomMessages(room.id, 200),
      getChatInboxItemsForUser(userId),
      getChatOtherProfileHref(userId === room.buyerId ? room.listing.userId : room.buyer.id),
    ]);
    inboxItems = inbox;
    const messageRows = Array.isArray(messages) ? messages : [];

    const seller = room.listing.user;
    const isBuyer = userId === room.buyerId;
    const otherName = isBuyer ? publicDisplayName(seller.name, "Seller") : publicDisplayName(room.buyer.name, "Buyer");
    const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
    const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);
    const cover = parseStoredListingImages(room.listing.images)[0] ?? null;

    bootstrap = {
      roomId: room.id,
      listing: {
        id: room.listing.id,
        title: room.listing.title,
        imageUrl: resolvePublicMediaUrl(cover),
        price: room.listing.price,
        priceCurrency: room.listing.priceCurrency,
        city: room.listing.city,
        condition: room.listing.condition,
      },
      seller: {
        id: seller.id,
        name: publicDisplayName(seller.name, "Seller"),
        avatarUrl: resolvePublicMediaUrl(seller.avatarUrl ?? null),
      },
      buyer: {
        id: room.buyer.id,
        name: publicDisplayName(room.buyer.name, "Buyer"),
        avatarUrl: resolvePublicMediaUrl(room.buyer.avatarUrl ?? null),
      },
      meIsBuyer: isBuyer,
      otherUserId: isBuyer ? seller.id : room.buyer.id,
      otherProfileHref,
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
    roomIdForKey = room.id;
  } catch (e) {
    console.error("[chat/room]", e);
  }

  if (!bootstrap) {
    return <ChatServerError />;
  }

  return (
    <ChatRoomView key={roomIdForKey} bootstrap={bootstrap} currentUserId={userId} inboxItems={inboxItems} />
  );
}
