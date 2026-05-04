import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import {
  readMustChangePasswordFromUserMetadata,
  readPrismaRoleFromUserMetadata,
} from "@/lib/supabase-auth-metadata";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Roluri care pot folosi site-ul în timpul mentenanței (fără cookie bypass). */
export const MAINTENANCE_LOGGED_SITE_ROLES = new Set(["TESTER", "ADMIN", "MODERATOR"]);

export async function refreshSupabaseSession(request: NextRequest, response: NextResponse): Promise<User | null> {
  if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
    return null;
  }
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.error("[proxy-auth] refreshSupabaseSession failed:", err);
    return null;
  }
}

export function canBypassMaintenanceWithSessionUser(user: User): boolean {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const role = readPrismaRoleFromUserMetadata(meta);
  return role != null && MAINTENANCE_LOGGED_SITE_ROLES.has(role);
}

export function userMustChangePasswordFromSession(user: User): boolean {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return readMustChangePasswordFromUserMetadata(meta);
}
