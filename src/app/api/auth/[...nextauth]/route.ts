/**
 * NextAuth App Router handler. Config lives in `src/auth.ts` (providers: Credentials, Google, Facebook).
 * Env: AUTH_SECRET or NEXTAUTH_SECRET, AUTH_URL or NEXTAUTH_URL, AUTH_GOOGLE_*, AUTH_FACEBOOK_*.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
