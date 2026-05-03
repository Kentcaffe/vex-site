"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  mergeSellerContactIntoPreferencesJson,
  normalizeTimeHHMM,
} from "@/lib/seller-contact-preferences";

export type UpdateProfileState =
  | { ok: true; name: string | null; avatarUrl: string | null; message?: string }
  | { ok: false; error: "unauthorized" | "validation" | "unknown"; message?: string };

const profileSchema = z.object({
  locale: z.string().min(2).max(8),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(32).optional(),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || /^https?:\/\//i.test(v), "invalid")
    .optional(),
  intent: z.enum(["save_profile", "delete_avatar"]).default("save_profile"),
  district: z.string().trim().max(80).optional(),
  buyerNote: z.string().trim().max(320).optional(),
  contactWindow: z.enum(["anytime", "hours", "no_calls"]).optional().catch(undefined),
  contactHourFrom: z.string().trim().max(5).optional(),
  contactHourTo: z.string().trim().max(5).optional(),
});

function toNull(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formChannelOn(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "1" || v === "on" || v === "true";
}

const AVATAR_BUCKET = "avatars";

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function extractStoragePathFromPublicUrl(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx < 0) return null;
  const path = value.slice(idx + marker.length).trim();
  return path || null;
}

function isMissingProfilesTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybe = error as { message?: unknown; code?: unknown };
  const message = typeof maybe.message === "string" ? maybe.message : "";
  const code = typeof maybe.code === "string" ? maybe.code : "";
  return (
    message.includes("public.profiles") ||
    message.includes("schema cache") ||
    code === "PGRST205" ||
    code === "42P01"
  );
}

export async function updateProfile(
  _prev: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    console.error("[profile:update] unauthorized: missing app session user id");
    return { ok: false, error: "unauthorized" };
  }
  if (!session.user.supabaseUserId?.trim()) {
    console.error("[profile:update] unauthorized: missing supabase auth id in session");
    return { ok: false, error: "unauthorized" };
  }

  const parsed = profileSchema.safeParse({
    locale: formData.get("locale"),
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    intent: formData.get("intent") || "save_profile",
    district: formData.get("district") || undefined,
    buyerNote: formData.get("buyerNote") || undefined,
    contactWindow: (formData.get("contactWindow") as string) || undefined,
    contactHourFrom: formData.get("contactHourFrom") || undefined,
    contactHourTo: formData.get("contactHourTo") || undefined,
  });

  if (!parsed.success) {
    console.error("[profile:update] validation failed", parsed.error.flatten());
    return { ok: false, error: "validation" };
  }

  const avatarFile = formData.get("avatarFile");

  try {
    const supabase = await createSupabaseServerClient();
    const supabaseUserId = session.user.supabaseUserId.trim();
    const intent = parsed.data.intent;
    const nextName = toNull(parsed.data.name);
    let nextAvatarUrl = toNull(parsed.data.avatarUrl);

    console.log("[profile:update] start", {
      userId: session.user.id,
      supabaseUserId,
      intent,
      hasAvatarFile:
        typeof File !== "undefined" && avatarFile instanceof File ? avatarFile.size > 0 : false,
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true, preferences: true },
    });

    const { data: existingProfileRow, error: existingProfileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", supabaseUserId)
      .maybeSingle();

    if (existingProfileError) {
      if (!isMissingProfilesTableError(existingProfileError)) {
        console.error("[profile:update] profiles select error", existingProfileError);
        return { ok: false, error: "unknown", message: existingProfileError.message };
      }
      console.warn("[profile:update] profiles table missing; fallback to prisma.user only");
    }

    const profilesAvailable = !existingProfileError || !isMissingProfilesTableError(existingProfileError);
    const existingAvatarPath =
      extractStoragePathFromPublicUrl(existingProfileRow?.avatar_url) ??
      extractStoragePathFromPublicUrl(currentUser?.avatarUrl);

    if (intent === "delete_avatar") {
      if (existingAvatarPath) {
        const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove([existingAvatarPath]);
        if (removeError) {
          console.error("[profile:update] avatar remove error", removeError);
          return { ok: false, error: "unknown", message: removeError.message };
        }
      }
      nextAvatarUrl = null;
    } else if (typeof File !== "undefined" && avatarFile instanceof File && avatarFile.size > 0) {
      const objectPath = `${supabaseUserId}/${Date.now()}-${safeFileName(avatarFile.name || "avatar")}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(objectPath, avatarFile, {
          upsert: true,
          cacheControl: "3600",
          contentType: avatarFile.type || undefined,
        });
      if (uploadError) {
        console.error("[profile:update] avatar upload error", uploadError);
        return { ok: false, error: "unknown", message: uploadError.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
      nextAvatarUrl = publicUrl;

      if (existingAvatarPath && existingAvatarPath !== objectPath) {
        const { error: removeOldError } = await supabase.storage.from(AVATAR_BUCKET).remove([existingAvatarPath]);
        if (removeOldError) {
          console.warn("[profile:update] old avatar remove warning", removeOldError);
        }
      }
    }

    let finalName = nextName;
    let finalAvatarUrl = nextAvatarUrl;

    if (profilesAvailable) {
      const { data: updatedProfileRows, error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          name: nextName,
          avatar_url: nextAvatarUrl,
        })
        .eq("id", supabaseUserId)
        .select("id,name,avatar_url");

      console.log("[profile:update] profiles update result", {
        count: updatedProfileRows?.length ?? 0,
        error: profileUpdateError?.message ?? null,
      });
      if (profileUpdateError) {
        console.error("[profile:update] profiles update error", profileUpdateError);
        return { ok: false, error: "unknown", message: profileUpdateError.message };
      }

      const { data: refreshedProfile, error: refreshError } = await supabase
        .from("profiles")
        .select("name,avatar_url")
        .eq("id", supabaseUserId)
        .maybeSingle();
      console.log("[profile:update] profiles refresh result", {
        hasData: Boolean(refreshedProfile),
        error: refreshError?.message ?? null,
      });
      if (refreshError) {
        console.error("[profile:update] profiles refresh error", refreshError);
        return { ok: false, error: "unknown", message: refreshError.message };
      }

      finalName = toNull(refreshedProfile?.name ?? undefined) ?? nextName;
      finalAvatarUrl = toNull(refreshedProfile?.avatar_url ?? undefined) ?? nextAvatarUrl;
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        name: finalName,
        full_name: finalName,
        avatar_url: finalAvatarUrl,
      },
    });
    console.log("[profile:update] auth metadata update result", {
      error: authUpdateError?.message ?? null,
    });
    if (authUpdateError) {
      console.error("[profile:update] auth metadata update error", authUpdateError);
      return { ok: false, error: "unknown", message: authUpdateError.message };
    }

    const cw = parsed.data.contactWindow === "hours" || parsed.data.contactWindow === "no_calls" ? parsed.data.contactWindow : "anytime";
    const nextPreferences = mergeSellerContactIntoPreferencesJson(currentUser?.preferences, {
      district: parsed.data.district ?? "",
      buyerNote: parsed.data.buyerNote ?? "",
      contactWindow: cw,
      contactHourFrom: normalizeTimeHHMM(parsed.data.contactHourFrom),
      contactHourTo: normalizeTimeHHMM(parsed.data.contactHourTo),
      channels: {
        phone: formChannelOn(formData, "channelPhone"),
        siteMessages: formChannelOn(formData, "channelSite"),
        whatsapp: formChannelOn(formData, "channelWhatsapp"),
        viber: formChannelOn(formData, "channelViber"),
        telegram: formChannelOn(formData, "channelTelegram"),
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: finalName,
        phone: toNull(parsed.data.phone),
        city: toNull(parsed.data.city),
        bio: toNull(parsed.data.bio),
        avatarUrl: finalAvatarUrl,
        preferences: nextPreferences,
      },
    });
    revalidatePath(localizedHref(parsed.data.locale, "/cont"));
    revalidatePath(localizedHref(parsed.data.locale, "/cont/setari"));
    revalidatePath(localizedHref(parsed.data.locale, "/chat"));
    return {
      ok: true,
      name: finalName,
      avatarUrl: finalAvatarUrl,
      message:
        intent === "delete_avatar"
          ? "Avatar șters."
          : profilesAvailable
            ? "Profil actualizat."
            : "Profil actualizat (fallback local, tabela Supabase profiles lipsește).",
    };
  } catch (error) {
    console.error("[profile:update] unknown error", error);
    return {
      ok: false,
      error: "unknown",
      message: error instanceof Error ? error.message : "Unknown profile update error",
    };
  }
}
