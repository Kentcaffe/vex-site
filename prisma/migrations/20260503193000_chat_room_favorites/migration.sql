-- Favorite conversații marketplace (per utilizator), fără localStorage.

CREATE TABLE "ChatRoomFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoomFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatRoomFavorite_userId_roomId_key" ON "ChatRoomFavorite"("userId", "roomId");
CREATE INDEX "ChatRoomFavorite_userId_idx" ON "ChatRoomFavorite"("userId");

ALTER TABLE "ChatRoomFavorite" ADD CONSTRAINT "ChatRoomFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatRoomFavorite" ADD CONSTRAINT "ChatRoomFavorite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
