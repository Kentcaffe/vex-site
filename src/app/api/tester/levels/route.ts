import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { normalizeTesterLevel, testerLevelLabelRo, type TesterLevel } from "@/lib/tester-level";
import { prisma } from "@/lib/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LevelPayload = {
  testerLevel: TesterLevel;
  labelRo: string;
};

/**
 * Returnează `tester_level` din Prisma pentru un set de `supabaseAuthId` (UUID).
 * Doar utilizatori cu acces la panoul tester pot apela.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canAccessTesterDashboard(session.user.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s));

  if (ids.length === 0) {
    return NextResponse.json({ levels: {} satisfies Record<string, LevelPayload> });
  }

  const unique = [...new Set(ids)].slice(0, 200);

  const rows = await prisma.$queryRaw<Array<{ supabaseAuthId: string | null; tester_level: string }>>(
    Prisma.sql`
      SELECT "supabaseAuthId", tester_level
      FROM users
      WHERE "supabaseAuthId"::text IN (${Prisma.join(unique.map((id) => Prisma.sql`${id}`))})
    `,
  );

  const levels: Record<string, LevelPayload> = {};
  for (const id of unique) {
    const row = rows.find((r) => r.supabaseAuthId === id);
    const testerLevel = normalizeTesterLevel(row?.tester_level);
    levels[id] = { testerLevel, labelRo: testerLevelLabelRo(testerLevel) };
  }

  return NextResponse.json({ levels });
}
