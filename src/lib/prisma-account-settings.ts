import type { Prisma } from "@prisma/client";

/**
 * Unele medii (TS server / cache IDE) pot rămâne în urmă față de `prisma generate`.
 * Folosim aserțiuni explicite către tipurile Prisma ca să evităm erori false pe `preferences`.
 */
export const userForAccountPageSelect = {
  email: true,
  name: true,
  avatarUrl: true,
  phone: true,
  city: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
  preferences: true,
} as unknown as Prisma.UserSelect;

export type UserForAccountPage = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  passwordHash: string | null;
  preferences: Prisma.JsonValue | null;
};

export const userPreferencesOnlySelect = { preferences: true } as unknown as Prisma.UserSelect;

export type UserPreferencesRow = {
  preferences: Prisma.JsonValue | null;
};

export const userPasswordAndPreferencesSelect = {
  passwordHash: true,
  preferences: true,
} as unknown as Prisma.UserSelect;

export type UserPasswordAndPreferencesRow = {
  passwordHash: string | null;
  preferences: Prisma.JsonValue | null;
};

export function userUpdatePreferences(data: Prisma.InputJsonValue): Prisma.UserUpdateInput {
  return { preferences: data } as unknown as Prisma.UserUpdateInput;
}

export function userUpdatePasswordAndPreferences(
  passwordHash: string,
  preferences: Prisma.InputJsonValue,
): Prisma.UserUpdateInput {
  return { passwordHash, preferences } as unknown as Prisma.UserUpdateInput;
}
