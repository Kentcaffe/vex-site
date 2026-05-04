import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-roles";
import { prisma } from "@/lib/prisma";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { pushAuthUserMetadataToSupabase } from "@/lib/supabase-auth-metadata";
import { ensureTesterActivityRow } from "@/lib/tester-activity-server";
import { logRouteError } from "@/lib/server-log";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** GET — listă testeri + activitate (admin). */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const status = url.searchParams.get("status") ?? "all";
    const sort = url.searchParams.get("sort") ?? "lastActive";

    const where: Prisma.UserWhereInput = {
      role: UserRole.TESTER,
      ...(q ? { email: { contains: q, mode: "insensitive" } } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      include: { testerActivity: true },
      orderBy: { email: "asc" },
      take: 300,
    });

    const inactiveDays = 7;
    const cutoff = Date.now() - inactiveDays * 86400000;

    const sorted = [...users].sort((a, b) => {
      const ta = a.testerActivity;
      const tb = b.testerActivity;
      if (sort === "email") {
        return a.email.localeCompare(b.email);
      }
      if (sort === "sessions") {
        return (tb?.sessionsCount ?? 0) - (ta?.sessionsCount ?? 0);
      }
      if (sort === "time") {
        return (tb?.totalTimeSpent ?? 0) - (ta?.totalTimeSpent ?? 0);
      }
      const da = ta?.lastActive ?? ta?.lastLogin;
      const db = tb?.lastActive ?? tb?.lastLogin;
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });

    const rows = sorted.map((u) => {
      const a = u.testerActivity;
      const last = a?.lastActive ?? a?.lastLogin;
      const inactive = !last || last.getTime() < cutoff;
      if (status === "active" && inactive) return null;
      if (status === "inactive" && !inactive) return null;
      return {
        id: u.id,
        email: u.email,
        lastLogin: a?.lastLogin?.toISOString() ?? null,
        sessionsCount: a?.sessionsCount ?? 0,
        totalTimeSpent: a?.totalTimeSpent ?? 0,
        lastActive: a?.lastActive?.toISOString() ?? null,
        lastPath: a?.lastPath ?? null,
        status: inactive ? ("inactive" as const) : ("active" as const),
      };
    });

    return NextResponse.json({
      ok: true,
      testers: rows.filter((x): x is NonNullable<typeof x> => x != null),
    });
  } catch (error) {
    logRouteError("GET /api/admin/testers", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}

type CreateBody = { email?: string; tempPassword?: string };

/** POST — creează utilizator Supabase + Prisma rol TESTER (admin). */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as CreateBody;
    const email = normalizeEmail(String(body.email ?? ""));
    const tempPassword = String(body.tempPassword ?? "");
    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (tempPassword.length < 10) {
      return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
    }

    const service = getSupabaseServiceClient();
    if (!service) {
      return NextResponse.json({ ok: false, error: "service_role_missing" }, { status: 503 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "email_exists" }, { status: 409 });
    }

    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        prisma_role: UserRole.TESTER,
        must_change_password: true,
      },
    });
    if (createErr || !created.user?.id) {
      return NextResponse.json(
        { ok: false, error: createErr?.message ?? "supabase_create_failed" },
        { status: 400 },
      );
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          role: UserRole.TESTER,
          supabaseAuthId: created.user.id,
          mustChangePassword: true,
        },
      });
    } catch (e) {
      await service.auth.admin.deleteUser(created.user.id);
      throw e;
    }
    await ensureTesterActivityRow(user.id);
    await pushAuthUserMetadataToSupabase({
      supabaseAuthId: created.user.id,
      prismaRole: UserRole.TESTER,
      mustChangePassword: true,
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    logRouteError("POST /api/admin/testers", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}

type PatchBody = { userId?: string; action?: "disable" };

/** PATCH — dezactivează tester (rol USER). */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    const body = (await request.json()) as PatchBody;
    const userId = String(body.userId ?? "");
    if (!userId || body.action !== "disable") {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, supabaseAuthId: true },
    });
    if (!u || u.role !== UserRole.TESTER) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.USER, mustChangePassword: false },
    });

    if (u.supabaseAuthId) {
      await pushAuthUserMetadataToSupabase({
        supabaseAuthId: u.supabaseAuthId,
        prismaRole: UserRole.USER,
        mustChangePassword: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logRouteError("PATCH /api/admin/testers", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
