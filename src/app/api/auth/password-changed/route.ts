import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pushAuthUserMetadataToSupabase } from "@/lib/supabase-auth-metadata";
import { prisma } from "@/lib/prisma";
import { logRouteError } from "@/lib/server-log";

/** După `supabase.auth.updateUser({ password })` pe client — golește flag-ul din Prisma + metadata JWT. */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const u = await prisma.user.update({
      where: { id: session.user.id },
      data: { mustChangePassword: false },
      select: { role: true },
    });
    await pushAuthUserMetadataToSupabase({
      supabaseAuthId: session.user.supabaseUserId,
      prismaRole: u.role,
      mustChangePassword: false,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logRouteError("POST /api/auth/password-changed", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
