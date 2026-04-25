import { NextResponse } from "next/server";
import { setBusinessVerified } from "@/app/actions/business";
import { safeApiRoute } from "@/lib/api-error";

export const POST = safeApiRoute("POST /api/admin/business/verify", async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const userId = typeof body === "object" && body && "userId" in body ? String((body as { userId: unknown }).userId) : "";
  const result = await setBusinessVerified(userId);
  if (!result.ok) {
    if (result.error === "unauthorized") {
      return NextResponse.json(result, { status: 403 });
    }
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
});
