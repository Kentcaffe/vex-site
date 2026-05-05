import { prisma } from "@/lib/prisma";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";

export type SupportSender = "user" | "admin";

export type SupportMessageRow = {
  id: string;
  user_id: string;
  message: string;
  sender: SupportSender;
  created_at: string;
};

const ADMIN_ONLINE_TTL_MS = 45_000;
let lastAdminPresenceAt = 0;

export function markAdminSupportPresenceNow() {
  lastAdminPresenceAt = Date.now();
}

export function isAdminSupportOnline() {
  return Date.now() - lastAdminPresenceAt <= ADMIN_ONLINE_TTL_MS;
}

export async function listSupportMessagesForUser(userId: string) {
  const service = getSupabaseServiceClient();
  if (!service) return [] as SupportMessageRow[];
  const { data } = await service
    .from("tester_support_messages")
    .select("id,user_id,message,sender,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []) as SupportMessageRow[];
}

export async function insertSupportMessage(input: {
  userId: string;
  message: string;
  sender: SupportSender;
}) {
  const service = getSupabaseServiceClient();
  if (!service) {
    return { ok: false as const, error: "service_role_missing" };
  }
  const cleanMessage = input.message.trim();
  if (!cleanMessage) {
    return { ok: false as const, error: "message_empty" };
  }
  if (cleanMessage.length > 4000) {
    return { ok: false as const, error: "message_too_long" };
  }
  const { error } = await service.from("tester_support_messages").insert({
    user_id: input.userId,
    message: cleanMessage,
    sender: input.sender,
  });
  if (error) {
    return { ok: false as const, error: error.message || "insert_failed" };
  }
  return { ok: true as const };
}

export async function listSupportConversationsForAdmin() {
  const service = getSupabaseServiceClient();
  if (!service) {
    return [] as Array<{
      user_id: string;
      email: string;
      name: string;
      last_message: string;
      last_sender: SupportSender;
      last_created_at: string;
      unread_count: number;
    }>;
  }
  const { data } = await service
    .from("tester_support_messages")
    .select("id,user_id,message,sender,created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  const rows = (data ?? []) as SupportMessageRow[];
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const users = await prisma.user.findMany({
    where: { supabaseAuthId: { in: userIds } },
    select: { supabaseAuthId: true, email: true, name: true },
  });
  const bySupabase = new Map(
    users
      .filter((u) => Boolean(u.supabaseAuthId))
      .map((u) => [
        u.supabaseAuthId as string,
        { email: u.email, name: u.name?.trim() || u.email.split("@")[0] || "Tester" },
      ]),
  );

  const grouped = new Map<
    string,
    { last: SupportMessageRow; unread_count: number }
  >();
  for (const row of rows) {
    const current = grouped.get(row.user_id);
    if (!current) {
      grouped.set(row.user_id, {
        last: row,
        unread_count: row.sender === "user" ? 1 : 0,
      });
      continue;
    }
    if (row.sender === "user") {
      current.unread_count += 1;
    }
  }

  return Array.from(grouped.entries())
    .map(([userId, meta]) => {
      const user = bySupabase.get(userId);
      return {
        user_id: userId,
        email: user?.email ?? "hidden",
        name: user?.name ?? "Tester",
        last_message: meta.last.message,
        last_sender: meta.last.sender,
        last_created_at: meta.last.created_at,
        unread_count: meta.unread_count,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.last_created_at).getTime() - new Date(a.last_created_at).getTime(),
    );
}
