import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LOGIN_DEBOUNCE_MS = 45_000;
const MAX_RECENT_PATHS = 20;

function mergeRecentPaths(prev: unknown, path: string): string[] {
  const arr = Array.isArray(prev) ? prev.filter((x): x is string => typeof x === "string") : [];
  const next = [path, ...arr.filter((p) => p !== path)];
  return next.slice(0, MAX_RECENT_PATHS);
}

export async function ensureTesterActivityRow(userId: string): Promise<void> {
  await prisma.testerActivity.upsert({
    where: { userId },
    create: {
      id: randomUUID(),
      userId,
      lastActive: new Date(),
    },
    update: { lastActive: new Date() },
  });
}

/** După login reușit: increment sesiune (debounce anti-dublu la refresh). */
export async function recordTesterLoginSession(userId: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const row = await tx.testerActivity.findUnique({ where: { userId } });
    if (!row) {
      await tx.testerActivity.create({
        data: {
          id: randomUUID(),
          userId,
          lastLogin: now,
          sessionsCount: 1,
          lastActive: now,
        },
      });
      return;
    }
    const last = row.lastLogin?.getTime() ?? 0;
    if (now.getTime() - last < LOGIN_DEBOUNCE_MS) {
      await tx.testerActivity.update({
        where: { userId },
        data: { lastActive: now },
      });
      return;
    }
    await tx.testerActivity.update({
      where: { userId },
      data: {
        lastLogin: now,
        sessionsCount: { increment: 1 },
        lastActive: now,
      },
    });
  });
}

type ActivityPayload = {
  type: "heartbeat" | "session_end";
  path?: string;
  /** Secunde de sesiune de adăugat la total (heartbeat sau închidere tab). */
  secondsDelta?: number;
};

export async function applyTesterActivityUpdate(userId: string, body: ActivityPayload): Promise<void> {
  const now = new Date();
  const path = typeof body.path === "string" && body.path.length > 0 ? body.path.slice(0, 512) : null;
  const sec = Math.min(Math.max(0, Math.floor(Number(body.secondsDelta) || 0)), 8 * 3600);

  await prisma.$transaction(async (tx) => {
    const row = await tx.testerActivity.findUnique({ where: { userId } });
    const recent: Prisma.JsonValue | undefined =
      path != null ? mergeRecentPaths(row?.recentPaths ?? null, path) : (row?.recentPaths as Prisma.JsonValue | undefined);

    const data: Prisma.TesterActivityUpdateInput = {
      lastActive: now,
      ...(path != null ? { lastPath: path, recentPaths: recent as Prisma.InputJsonValue } : {}),
      ...(sec > 0 ? { totalTimeSpent: { increment: sec } } : {}),
    };

    if (!row) {
      await tx.testerActivity.create({
        data: {
          id: randomUUID(),
          userId,
          lastActive: now,
          lastPath: path,
          recentPaths: path ? ([path] as Prisma.InputJsonValue) : undefined,
          totalTimeSpent: sec,
        },
      });
      return;
    }
    await tx.testerActivity.update({ where: { userId }, data });
  });
}
