import { prisma } from "./prisma";

/**
 * Models exist after `prisma generate`. Some editor TS caches serve an incomplete PrismaClient
 * (especially with the SQLite adapter); accessing delegates via `any` keeps the UI clean.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegates; see above
const p = prisma as any;

export const otherContentReport = p.otherContentReport;
export const userNotification = p.userNotification;
export const passwordResetToken = p.passwordResetToken;
