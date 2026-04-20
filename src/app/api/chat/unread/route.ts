import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unreadTotalForUser } from "@/lib/chat-actions";
import { logRouteError } from "@/lib/server-log";

/**
 * Răspuns stabil pentru client: mereu 200 cu `{ count }` — fără excepții neprinse.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const count = await unreadTotalForUser(session.user.id);
    return NextResponse.json({ count: typeof count === "number" && Number.isFinite(count) ? count : 0 }, { status: 200 });
  } catch (e) {
    logRouteError("GET /api/chat/unread", e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
