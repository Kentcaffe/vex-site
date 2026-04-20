import { prisma } from "./prisma";

/**
 * Models exist after `prisma generate`. Some editor TS caches serve an incomplete PrismaClient;
 * accessing delegates via `any` keeps the UI clean. Include `supportTicket` / `supportMessage`
 * when the IDE omits newer models on `prisma.*`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma delegates; see above
const p = prisma as any;

export const otherContentReport = p.otherContentReport;
export const userNotification = p.userNotification;
export const passwordResetToken = p.passwordResetToken;
export const supportTicket = p.supportTicket;
export const supportMessage = p.supportMessage;
export const feedback = p.feedback;
export const feedbackReply = p.feedbackReply;
export const adminLog = p.adminLog;
