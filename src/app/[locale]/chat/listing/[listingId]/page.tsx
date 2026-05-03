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

type Props = { params: Promise<{ locale: string; listingId: string }> };

/** Buyer opens chat from listing — creates room if needed, same UI as /chat/room/[roomId]. */
export default async function ChatFromListingPage({ params }: Props) {
  const { locale, listingId } = await params;
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
    const buyerRow = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (!buyerRow) {
      redirect(localizedHref(locale, "/cont"));
    }

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, ...listingWhereActive() },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    if (!listing) {
      notFound();
    }
    if (listing.userId === userId) {
      redirect(localizedHref(locale, "/chat"));
    }

    const room = await prisma.chatRoom.upsert({
      where: { listingId_buyerId: { listingId, buyerId: userId } },
      create: { listingId, buyerId: userId },
      update: {},
      include: {
        readStates: { where: { userId: { in: [userId, listing.userId] } } },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const [messages, inbox, otherProfileHref] = await Promise.all([
      listRoomMessages(room.id, 200),
      getChatInboxItemsForUser(userId),
      getChatOtherProfileHref(listing.userId),
    ]);
    inboxItems = inbox;
    const messageRows = Array.isArray(messages) ? messages : [];

    const seller = listing.user;
    const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
    const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);
    const cover = parseStoredListingImages(listing.images)[0] ?? null;

    bootstrap = {
      roomId: room.id,
      listing: {
        id: listing.id,
        title: listing.title,
        imageUrl: resolvePublicMediaUrl(cover),
        price: listing.price,
        priceCurrency: listing.priceCurrency,
        city: listing.city,
        condition: listing.condition,
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
      meIsBuyer: true,
      otherUserId: seller.id,
      otherProfileHref,
      otherUserName: publicDisplayName(seller.name, "Seller"),
      otherUserAvatarUrl: resolvePublicMediaUrl(seller.avatarUrl ?? null),
      myAvatarUrl: resolvePublicMediaUrl(buyerRow.avatarUrl ?? null),
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
    console.error("[chat/listing]", e);
  }

  if (!bootstrap) {
    return <ChatServerError />;
  }

  return (
    <ChatRoomView key={roomIdForKey} bootstrap={bootstrap} currentUserId={userId} inboxItems={inboxItems} />
  );
}
