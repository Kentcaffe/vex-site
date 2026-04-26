"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";
import { isTesterLikeRole, type BugCategory, type BugSeverity, type BugStatus } from "@/lib/tester-bugs";

type SubmitState = {
  ok: boolean;
  message: string;
  error?: string;
};

type ReviewState = {
  ok: boolean;
  error?: string;
};

const VALID_CATEGORIES = new Set<BugCategory>(["ui", "functional", "security"]);
const VALID_SEVERITIES = new Set<BugSeverity>(["low", "medium", "high"]);
const VALID_STATUS = new Set<BugStatus>(["open", "accepted", "rejected"]);

export async function submitBugReport(_prevState: SubmitState, formData: FormData): Promise<SubmitState> {
  const session = await auth();
  const role = session?.user?.role;
  const supabaseUserId = session?.user?.supabaseUserId;
  if (!session?.user?.id || !supabaseUserId || !isTesterLikeRole(role)) {
    return { ok: false, message: "", error: "Nu ai acces la tester dashboard." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").toLowerCase() as BugCategory;
  const severity = String(formData.get("severity") ?? "").toLowerCase() as BugSeverity;
  const image = formData.get("image");

  if (title.length < 4 || description.length < 10) {
    return { ok: false, message: "", error: "Completeaza corect titlul si descrierea bug-ului." };
  }
  if (!VALID_CATEGORIES.has(category) || !VALID_SEVERITIES.has(severity)) {
    return { ok: false, message: "", error: "Categoria sau severitatea sunt invalide." };
  }

  const supabase = await createSupabaseServerClient();

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    const ext = image.name.includes(".") ? image.name.split(".").pop() : "png";
    const fileName = `${supabaseUserId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const upload = await supabase.storage.from("bugs").upload(fileName, image, {
      cacheControl: "3600",
      upsert: false,
      contentType: image.type || "image/png",
    });
    if (upload.error) {
      return { ok: false, message: "", error: "Upload imagine esuat. Incearca din nou." };
    }
    const publicUrlRes = supabase.storage.from("bugs").getPublicUrl(fileName);
    imageUrl = publicUrlRes.data.publicUrl;
  }

  const insert = await supabase.from("bugs").insert({
    user_id: supabaseUserId,
    title,
    description,
    image_url: imageUrl,
    category,
    severity,
    status: "open",
    reward: 0,
  });

  if (insert.error) {
    return { ok: false, message: "", error: insert.error.message || "Nu am putut salva bug-ul." };
  }

  revalidatePath("/tester");
  revalidatePath("/admin/bugs");
  return { ok: true, message: "Bug trimis cu succes 🚀" };
}

export async function reviewBugReport(_prevState: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  const roleValue = String(session?.user?.role ?? "").toUpperCase();
  if (!session?.user?.id || roleValue !== "ADMIN") {
    return { ok: false, error: "Doar admin poate modera bug-uri." };
  }

  const bugId = String(formData.get("bugId") ?? "");
  const status = String(formData.get("status") ?? "").toLowerCase() as BugStatus;
  const reward = Math.max(0, Number(formData.get("reward") ?? 0));

  if (!bugId || !VALID_STATUS.has(status)) {
    return { ok: false, error: "Date invalide pentru moderare." };
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return { ok: false, error: "Lipseste configurarea service role pentru Supabase." };
  }

  const update = await service
    .from("bugs")
    .update({ status, reward })
    .eq("id", bugId);
  if (update.error) {
    return { ok: false, error: update.error.message || "Nu am putut actualiza bug-ul." };
  }

  revalidatePath("/admin/bugs");
  revalidatePath("/tester");
  return { ok: true };
}

