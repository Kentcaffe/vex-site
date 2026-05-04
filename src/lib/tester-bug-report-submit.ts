import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { routing } from "@/i18n/routing";
import { checkRateLimit } from "@/lib/request-rate-limit";
import { localizedHref } from "@/lib/paths";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { type BugCategory, type BugSeverity } from "@/lib/tester-bugs";

export type TesterBugSubmitState = {
  ok: boolean;
  message: string;
  error?: string;
};

const VALID_CATEGORIES = new Set<BugCategory>(["ui", "functional", "security"]);
const VALID_SEVERITIES = new Set<BugSeverity>(["low", "medium", "high"]);

/** Fișierele din FormData în Route Handler / Server Action sunt Blob (inclusiv File); `instanceof File` poate eșua. */
function collectImageBlobs(entries: FormDataEntryValue[]): Blob[] {
  const blobs: Blob[] = [];
  for (const entry of entries) {
    if (typeof Blob !== "undefined" && entry instanceof Blob && entry.size > 0) {
      blobs.push(entry);
    }
  }
  return blobs;
}

function extForImageBlob(blob: Blob): string {
  const t = (blob.type ?? "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg") {
    return "jpg";
  }
  if (t === "image/png") {
    return "png";
  }
  if (t === "image/webp") {
    return "webp";
  }
  if (t === "image/gif") {
    return "gif";
  }
  return "png";
}

function contentTypeForBlob(blob: Blob): string {
  const t = blob.type?.trim() ?? "";
  if (/^image\/(jpeg|jpg|png|webp|gif)$/i.test(t)) {
    return t.replace(/^image\/jpg$/i, "image/jpeg");
  }
  return "image/png";
}

function uploadErrorHint(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("mime") || m.includes("type") || m.includes("invalid")) {
    return "Format neacceptat sau bucket neconfigurat. Folosește PNG, JPEG, WebP sau GIF (max. 5 MB). Verifică în Supabase că bucketul `bugs` permite aceste tipuri.";
  }
  if (m.includes("size") || m.includes("large") || m.includes("exceeded")) {
    return "Fișier prea mare (max. 5 MB per imagine).";
  }
  if (m.includes("row-level security") || m.includes("policy") || m.includes("unauthorized") || m.includes("403")) {
    return "Permisiuni Storage: rulează scriptul SQL pentru bucket `bugs` sau setează SUPABASE_SERVICE_ROLE_KEY pe server.";
  }
  return "Upload imagini eșuat. Încearcă din nou.";
}

/**
 * Logică partajată: Server Action + POST /api/tester/bugs (evită UnrecognizedActionError la deploy).
 */
export async function submitTesterBugReport(formData: FormData): Promise<TesterBugSubmitState> {
  const session = await auth();
  const role = session?.user?.role;
  const supabaseUserId = session?.user?.supabaseUserId;
  if (!session?.user?.id || !supabaseUserId || !canAccessTesterDashboard(role)) {
    return { ok: false, message: "", error: "Nu ai acces la tester dashboard." };
  }
  const rl = checkRateLimit({
    key: `tester_bug_submit:${session.user.id}`,
    limit: 6,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return {
      ok: false,
      message: "",
      error: `Prea multe încercări. Încearcă din nou în ${rl.retryAfterSec}s.`,
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const stepsToReproduce = String(formData.get("stepsToReproduce") ?? "").trim();
  const expectedResult = String(formData.get("expectedResult") ?? "").trim();
  const actualResult = String(formData.get("actualResult") ?? "").trim();
  const pageUrlRaw = String(formData.get("pageUrl") ?? "").trim();
  const browserInfo = String(formData.get("browserInfo") ?? "").trim();
  const deviceInfo = String(formData.get("deviceInfo") ?? "").trim();
  const reproducibility = String(formData.get("reproducibility") ?? "").trim();
  const category = String(formData.get("category") ?? "").toLowerCase() as BugCategory;
  const severity = String(formData.get("severity") ?? "").toLowerCase() as BugSeverity;
  const imagesRaw = formData.getAll("images");
  const imageBlobs = collectImageBlobs(imagesRaw);

  if (imageBlobs.length === 0) {
    return {
      ok: false,
      message: "",
      error: "Adaugă cel puțin o captură de ecran (obligatoriu, până la 5 imagini).",
    };
  }
  if (imageBlobs.length > 5) {
    return { ok: false, message: "", error: "Poți încărca maximum 5 imagini." };
  }

  if (title.length < 4 || description.length < 10 || stepsToReproduce.length < 10) {
    return { ok: false, message: "", error: "Completeaza titlu, descriere si pasii de reproducere (minim 10 caractere)." };
  }
  if (!VALID_CATEGORIES.has(category) || !VALID_SEVERITIES.has(severity)) {
    return { ok: false, message: "", error: "Categoria sau severitatea sunt invalide." };
  }
  if (expectedResult.length < 5 || actualResult.length < 5) {
    return { ok: false, message: "", error: "Completeaza rezultatul asteptat si rezultatul actual." };
  }
  const pageUrl = pageUrlRaw.length > 0 ? pageUrlRaw : null;
  if (pageUrl && !/^https?:\/\//i.test(pageUrl)) {
    return { ok: false, message: "", error: "Linkul paginii trebuie sa inceapa cu http:// sau https://." };
  }

  const supabase = await createSupabaseServerClient();
  /** Upload cu service role evită eșecul RLS pe Storage când sesiunea Supabase din cookie nu e aliniată; calea rămâne sub `userId/…`. */
  const storageClient = getSupabaseServiceClient() ?? supabase;

  const imageUrls: string[] = [];
  for (let i = 0; i < imageBlobs.length; i += 1) {
    const blob = imageBlobs[i]!;
    if (blob.size > 5 * 1024 * 1024) {
      return { ok: false, message: "", error: "Fiecare imagine trebuie să aibă cel mult 5 MB." };
    }
    const ext = extForImageBlob(blob);
    const fileName = `${supabaseUserId}/${Date.now()}-${i}-${crypto.randomUUID()}.${ext}`;
    const contentType = contentTypeForBlob(blob);
    const upload = await storageClient.storage.from("bugs").upload(fileName, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });
    if (upload.error) {
      console.error("[tester-bugs] storage upload failed", {
        userId: supabaseUserId,
        fileName,
        message: upload.error.message,
      });
      return {
        ok: false,
        message: "",
        error: uploadErrorHint(upload.error.message ?? ""),
      };
    }
    const publicUrlRes = storageClient.storage.from("bugs").getPublicUrl(fileName);
    imageUrls.push(publicUrlRes.data.publicUrl);
  }

  const imageUrl = imageUrls[0] ?? null;

  const insert = await supabase.from("bugs").insert({
    user_id: supabaseUserId,
    title,
    description,
    steps_to_reproduce: stepsToReproduce,
    expected_result: expectedResult,
    actual_result: actualResult,
    page_url: pageUrl,
    browser_info: browserInfo || null,
    device_info: deviceInfo || null,
    reproducibility: reproducibility || null,
    image_url: imageUrl,
    image_urls: imageUrls,
    category,
    severity,
    status: "open",
    reward: 0,
  });

  if (insert.error) {
    console.error("[tester-bugs] submit insert failed", {
      userId: supabaseUserId,
      error: insert.error.message,
      code: insert.error.code,
      hint: insert.error.hint,
    });
    return { ok: false, message: "", error: insert.error.message || "Nu am putut salva bug-ul." };
  }

  for (const loc of routing.locales) {
    revalidatePath(localizedHref(loc, "/tester"), "layout");
    revalidatePath(localizedHref(loc, "/cont"));
  }
  revalidatePath("/admin/bugs");
  return { ok: true, message: "Raport trimis cu succes 🚀" };
}
