import { NextResponse } from "next/server";
import { approveBusinessApplication, rejectBusinessApplication } from "@/app/actions/business";
import { safeApiRoute } from "@/lib/api-error";

export const POST = safeApiRoute("POST /api/admin/business/decision", async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const applicationId =
    typeof body === "object" && body && "applicationId" in body ? String((body as { applicationId: unknown }).applicationId) : "";
  const decision =
    typeof body === "object" && body && "decision" in body ? String((body as { decision: unknown }).decision) : "";

  const result =
    decision === "approve"
      ? await approveBusinessApplication(applicationId)
      : await rejectBusinessApplication(applicationId);

  if (!result.ok) {
    if (result.error === "unauthorized") {
      return NextResponse.json(result, { status: 403 });
    }
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
});
