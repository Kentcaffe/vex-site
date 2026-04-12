import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { CHAT_MESSAGE_MAX, getRoomAccess } from "./lib/chat-actions";
import { prisma } from "./lib/prisma";
import { verifySocketToken } from "./lib/socket-auth";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const corsOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: [corsOrigin, /^http:\/\/127\.0\.0\.1:\d+$/], credentials: true },
  transports: ["websocket", "polling"],
});

io.use((socket, next) => {
  const raw = socket.handshake.auth?.token;
  const token = typeof raw === "string" ? raw : undefined;
  if (!token) {
    next(new Error("unauthorized"));
    return;
  }
  const v = verifySocketToken(token);
  if (!v) {
    next(new Error("unauthorized"));
    return;
  }
  socket.data.userId = v.userId;
  next();
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  void socket.join(`user:${userId}`);

  socket.on("room:join", async (payload: { roomId?: string }, cb?: (err?: string) => void) => {
    try {
      const roomId = typeof payload?.roomId === "string" ? payload.roomId : "";
      if (!roomId) {
        cb?.("invalid");
        return;
      }
      const access = await getRoomAccess(roomId, userId);
      if (!access) {
        cb?.("forbidden");
        return;
      }
      await socket.join(`chat:${roomId}`);
      cb?.();
    } catch {
      cb?.("error");
    }
  });

  socket.on("room:leave", (payload: { roomId?: string }) => {
    const roomId = typeof payload?.roomId === "string" ? payload.roomId : "";
    if (roomId) {
      void socket.leave(`chat:${roomId}`);
    }
  });

  socket.on("message:send", async (payload: { roomId?: string; body?: string }) => {
    const roomId = typeof payload?.roomId === "string" ? payload.roomId : "";
    const bodyRaw = typeof payload?.body === "string" ? payload.body : "";
    const body = bodyRaw.trim();
    if (!roomId || !body || body.length > CHAT_MESSAGE_MAX) {
      return;
    }
    const access = await getRoomAccess(roomId, userId);
    if (!access) {
      return;
    }
    const msg = await prisma.chatMessage.create({
      data: { roomId, senderId: userId, body },
    });
    await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });

    const out = {
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    };
    io.to(`chat:${roomId}`).emit("message:new", out);

    const recipientId = userId === access.buyerId ? access.sellerId : access.buyerId;
    const listing = await prisma.listing.findUnique({
      where: { id: access.listingId },
      select: { id: true, title: true },
    });
    io.to(`user:${recipientId}`).emit("chat:notify", {
      roomId,
      listingId: access.listingId,
      listingTitle: listing?.title ?? "",
      preview: body.slice(0, 120),
      fromUserId: userId,
    });
    io.to(`user:${recipientId}`).emit("unread:refresh");
  });

  socket.on("typing", async (payload: { roomId?: string; typing?: boolean }) => {
    const roomId = typeof payload?.roomId === "string" ? payload.roomId : "";
    const typing = Boolean(payload?.typing);
    if (!roomId) {
      return;
    }
    const access = await getRoomAccess(roomId, userId);
    if (!access) {
      return;
    }
    socket.to(`chat:${roomId}`).emit("typing", { roomId, userId, typing });
  });

  socket.on("read", async (payload: { roomId?: string }) => {
    const roomId = typeof payload?.roomId === "string" ? payload.roomId : "";
    if (!roomId) {
      return;
    }
    const access = await getRoomAccess(roomId, userId);
    if (!access) {
      return;
    }
    const now = new Date();
    await prisma.chatReadState.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, lastReadAt: now },
      update: { lastReadAt: now },
    });
    const otherId = userId === access.buyerId ? access.sellerId : access.buyerId;
    io.to(`chat:${roomId}`).emit("read:update", {
      roomId,
      userId,
      lastReadAt: now.toISOString(),
    });
    io.to(`user:${otherId}`).emit("unread:refresh");
  });
});

httpServer.listen(PORT, () => {
  console.log(`[socket] listening on ${PORT} (cors: ${corsOrigin})`);
});

async function shutdown() {
  await prisma.$disconnect();
  httpServer.close();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
