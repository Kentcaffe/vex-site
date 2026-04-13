import { randomBytes } from "node:crypto";
import type { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** Unusable bcrypt hash for OAuth-only rows (email/password login will never match). */
async function placeholderPasswordHash(): Promise<string> {
  return hash(randomBytes(32).toString("hex"), 4);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  /** Do not log noisy "failed login" as server errors (UI shows a friendly message instead). */
  logger: {
    error(error) {
      const text =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? `${error.name} ${error.message}`
            : String(error);
      if (/CredentialsSignin/i.test(text)) {
        return;
      }
      console.error(error);
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.trim().toLowerCase() },
        });
        if (!user?.passwordHash) {
          return null;
        }
        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.avatarUrl ?? undefined,
          role: user.role,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [
          Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google" || account.provider === "facebook") {
          const email = user.email?.trim().toLowerCase();
          if (!email) {
            return token;
          }
          const dbUser = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              name: user.name,
              avatarUrl: user.image ?? null,
              passwordHash: await placeholderPasswordHash(),
            },
            update: {
              name: user.name ?? undefined,
              avatarUrl: user.image ?? undefined,
            },
          });
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.picture = dbUser.avatarUrl ?? user.image ?? null;
          return token;
        }
        if (account.provider === "credentials") {
          token.id = user.id;
          token.role = (user as { role: UserRole }).role;
          token.picture = user.image ?? null;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // Never use `token.sub` as DB user id — it's the OAuth provider subject, not our User.id.
        // Using it caused FK violations (P2003) on reports/notifications keyed by User.id.
        const id = typeof token.id === "string" && token.id.length > 0 ? token.id : "";
        session.user.id = id;
        session.user.role = (token.role as UserRole) ?? "USER";
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
});
