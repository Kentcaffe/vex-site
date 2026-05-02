-- Nivel tester (chat / permisiuni). Nu modifică coloana role.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tester_level" TEXT NOT NULL DEFAULT 'trial';
