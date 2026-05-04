import type { UserRole } from "@prisma/client";
import { getSupabaseServiceClient } from "@/lib/supabase-service-role";

/** Sincronizează rolul și flag-ul de parolă în `user_metadata` pentru middleware (Edge) fără Prisma. */
export async function pushAuthUserMetadataToSupabase(opts: {
  supabaseAuthId: string;
  prismaRole: UserRole;
  mustChangePassword: boolean;
}): Promise<void> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return;
  }
  try {
    const { data: userRes, error: getErr } = await service.auth.admin.getUserById(opts.supabaseAuthId);
    if (getErr || !userRes?.user) {
      return;
    }
    const prev = (userRes.user.user_metadata ?? {}) as Record<string, unknown>;
    await service.auth.admin.updateUserById(opts.supabaseAuthId, {
      user_metadata: {
        ...prev,
        prisma_role: opts.prismaRole,
        must_change_password: opts.mustChangePassword,
      },
    });
  } catch (e) {
    console.error("[supabase-auth-metadata] push failed", e);
  }
}

export function readPrismaRoleFromUserMetadata(metadata: Record<string, unknown> | undefined | null): string | null {
  if (!metadata) return null;
  const v = metadata.prisma_role;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function readMustChangePasswordFromUserMetadata(metadata: Record<string, unknown> | undefined | null): boolean {
  if (!metadata) return false;
  return metadata.must_change_password === true;
}
