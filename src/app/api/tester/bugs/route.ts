import { NextResponse } from "next/server";
import { submitTesterBugReport } from "@/lib/tester-bug-report-submit";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, message: "", error: "Content-Type invalid." },
        { status: 415 },
      );
    }
    const formData = await request.formData();
    const state = await submitTesterBugReport(formData);
    return NextResponse.json(state, { status: state.ok ? 200 : 400 });
  } catch (e) {
    console.error("[api/tester/bugs] POST", e);
    return NextResponse.json(
      { ok: false, message: "", error: "Eroare temporară la server. Încearcă din nou." },
      { status: 500 },
    );
  }
}
