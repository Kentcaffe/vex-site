import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items) {
          try {
            for (const item of items) {
              cookieStore.set(item.name, item.value, item.options);
            }
          } catch {
            // În Server Components, Next.js nu permite scrierea cookie-urilor; reîmprospătarea
            // Reîmprospătarea sesiei se face în `src/proxy.ts` (edge middleware, Next.js 16). Vezi Supabase SSR + App Router.
          }
        },
      },
    },
  );
}
