export type ChatListingBootstrap = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  priceCurrency: string;
  city: string;
  condition: string;
};

export type ChatBootstrap = {
  roomId: string;
  listing: ChatListingBootstrap;
  seller: { id: string; name: string; avatarUrl: string | null };
  buyer?: { id: string; name: string; avatarUrl: string | null };
  meIsBuyer: boolean;
  otherUserId: string;
  /** Link public firmă, dacă există; altfel null (ascundem „Vezi profil”). */
  otherProfileHref: string | null;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  myAvatarUrl: string | null;
  messages: { id: string; senderId: string; body: string; createdAt: string }[];
  otherLastReadAt: string | null;
  myLastReadAt: string | null;
  maxBodyLength: number;
};
