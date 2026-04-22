-- Align User cu schema Prisma: coloană folosită la sincronizare Supabase (opțională în DB vechi).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseAuthId" TEXT;
