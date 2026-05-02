import type { UserRole } from "@prisma/client";
import { isMissingListingColumnError } from "@/lib/prisma-listing-queries";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    supabaseUserId: string;
  };
};

type SyncInput = {
  supabaseUserId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

async function upsertPrismaUserFromSupabase(input: SyncInput) {
  const email = normalizeEmail(input.email);

  async function syncWithOptionalSupabaseAuthId(includeSupabaseAuthId: boolean) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { name: true, avatarUrl: true },
    });

    if (existing) {
      const data: { supabaseAuthId?: string; name?: string | null; avatarUrl?: string | null } = {};
      if (includeSupabaseAuthId) {
        data.supabaseAuthId = input.supabaseUserId;
      }
      // Nu suprascrie numele/poza salvate din cont: la login Google reîmprospătează user_metadata
      // și ar anula updateProfile. Completăm din OAuth doar dacă în DB încă e gol.
      if (!existing.name?.trim() && input.name?.trim()) {
        data.name = input.name.trim();
      }
      if (!existing.avatarUrl?.trim() && input.avatarUrl?.trim()) {
        data.avatarUrl = input.avatarUrl.trim();
      }
      if (Object.keys(data).length === 0) {
        return prisma.user.findUniqueOrThrow({ where: { email } });
      }
      return prisma.user.update({ where: { email }, data });
    }

    return prisma.user.create({
      data: {
        email,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
        ...(includeSupabaseAuthId ? { supabaseAuthId: input.supabaseUserId } : {}),
      },
    });
  }

  try {
    return await syncWithOptionalSupabaseAuthId(true);
  } catch (err) {
    if (isMissingListingColumnError(err, "supabaseAuthId")) {
      console.error(
        "[auth] Coloana User.supabaseAuthId lipsește în DB — sincronizare fără ea (rulează migrările sau ALTER TABLE).",
        err,
      );
      return syncWithOptionalSupabaseAuthId(false);
    }
    throw err;
  }
}

function metadataName(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;
  const preferred = metadata.full_name ?? metadata.name;
  return typeof preferred === "string" && preferred.trim().length > 0 ? preferred.trim() : null;
}

function metadataAvatar(metadata: Record<string, unknown> | undefined): string | null {
  if (!metadata) return null;
  const preferred = metadata.avatar_url;
  return typeof preferred === "string" && preferred.trim().length > 0 ? preferred.trim() : null;
}

export async function syncAuthenticatedUserToPrisma(): Promise<AppSession | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }
  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: userData, error: userError }] = await Promise.all([supabase.auth.getUser()]);

    if (userError || !userData.user?.id || !userData.user.email) {
      return null;
    }

    const authUser = userData.user;
    const authEmail = authUser.email;
    if (!authEmail) {
      return null;
    }
    const dbUser = await upsertPrismaUserFromSupabase({
      supabaseUserId: authUser.id,
      email: authEmail,
      name: metadataName(authUser.user_metadata as Record<string, unknown> | undefined),
      avatarUrl: metadataAvatar(authUser.user_metadata as Record<string, unknown> | undefined),
    });

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.avatarUrl,
        role: dbUser.role,
        supabaseUserId: authUser.id,
      },
    };
  } catch (error) {
    console.error("[auth] syncAuthenticatedUserToPrisma failed", error);
    return null;
  }
}

export async function auth(): Promise<AppSession | null> {
  try {
    return await syncAuthenticatedUserToPrisma();
  } catch (error) {
    console.error("[auth] auth() failed", error);
    return null;
  }
}

export async function signOut(_opts?: { redirect?: boolean }): Promise<void> {
  void _opts;
  if (!hasSupabaseEnv()) {
    return;
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] Supabase signOut failed:", error.message);
  }
}
