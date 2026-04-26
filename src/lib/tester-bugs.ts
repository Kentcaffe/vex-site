import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";

export type BugStatus = "open" | "accepted" | "rejected";
export type BugCategory = "ui" | "functional" | "security";
export type BugSeverity = "low" | "medium" | "high";

export type BugRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: BugCategory;
  severity: BugSeverity;
  status: BugStatus;
  reward: number;
  created_at: string;
};

export type BugAdminRow = BugRow & {
  user_name: string;
  user_email: string;
};

export function isTesterLikeRole(role: unknown): boolean {
  const value = String(role ?? "").toUpperCase();
  return value === "TESTER" || value === "MODERATOR" || value === "ADMIN";
}

export async function listOwnBugs(supabaseUserId: string): Promise<BugRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("bugs")
    .select("id,user_id,title,description,image_url,category,severity,status,reward,created_at")
    .eq("user_id", supabaseUserId)
    .order("created_at", { ascending: false });
  return (data ?? []) as BugRow[];
}

export async function listAllBugsForAdmin(): Promise<BugAdminRow[]> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return [];
  }
  const { data } = await service
    .from("bugs")
    .select("id,user_id,title,description,image_url,category,severity,status,reward,created_at")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as BugRow[];
  if (rows.length === 0) {
    return [];
  }
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const users = await prisma.user.findMany({
    where: { supabaseAuthId: { in: userIds } },
    select: { supabaseAuthId: true, name: true, email: true },
  });
  const bySupabaseId = new Map(
    users
      .filter((u) => Boolean(u.supabaseAuthId))
      .map((u) => [u.supabaseAuthId as string, { name: u.name ?? "Tester", email: u.email }]),
  );
  return rows.map((r) => {
    const user = bySupabaseId.get(r.user_id);
    return {
      ...r,
      user_name: user?.name ?? "Tester",
      user_email: user?.email ?? "hidden",
    };
  });
}

export async function listLeaderboard(limit = 10): Promise<Array<{ user_name: string; accepted_count: number; total_reward: number }>> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return [];
  }
  const { data } = await service
    .from("bugs")
    .select("user_id,status,reward")
    .eq("status", "accepted");
  const rows = (data ?? []) as Array<{ user_id: string; status: string; reward: number | null }>;
  if (rows.length === 0) {
    return [];
  }
  const agg = new Map<string, { accepted_count: number; total_reward: number }>();
  for (const row of rows) {
    const cur = agg.get(row.user_id) ?? { accepted_count: 0, total_reward: 0 };
    cur.accepted_count += 1;
    cur.total_reward += Number(row.reward ?? 0);
    agg.set(row.user_id, cur);
  }
  const userIds = Array.from(agg.keys());
  const users = await prisma.user.findMany({
    where: { supabaseAuthId: { in: userIds } },
    select: { supabaseAuthId: true, name: true },
  });
  const bySupabaseId = new Map(
    users
      .filter((u) => Boolean(u.supabaseAuthId))
      .map((u) => [u.supabaseAuthId as string, u.name ?? "Tester"]),
  );
  return Array.from(agg.entries())
    .map(([id, stats]) => ({
      user_name: bySupabaseId.get(id) ?? "Tester",
      accepted_count: stats.accepted_count,
      total_reward: stats.total_reward,
    }))
    .sort((a, b) => b.accepted_count - a.accepted_count || b.total_reward - a.total_reward)
    .slice(0, Math.max(1, limit));
}

