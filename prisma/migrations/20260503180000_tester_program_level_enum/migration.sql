-- tester_level: TEXT → enum Postgres (dropdown în Supabase + validare DB).
-- Rulează după migrarea care a adăugat coloana text (20260502120000_user_tester_level).

DO $$
BEGIN
  CREATE TYPE "TesterProgramLevel" AS ENUM ('trial', 'tester', 'advanced', 'lead');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

ALTER TABLE "users" ALTER COLUMN "tester_level" DROP DEFAULT;

ALTER TABLE "users"
  ALTER COLUMN "tester_level" TYPE "TesterProgramLevel"
  USING (
    CASE LOWER(TRIM(COALESCE("tester_level"::text, '')))
      WHEN 'tester' THEN 'tester'::"TesterProgramLevel"
      WHEN 'advanced' THEN 'advanced'::"TesterProgramLevel"
      WHEN 'lead' THEN 'lead'::"TesterProgramLevel"
      ELSE 'trial'::"TesterProgramLevel"
    END
  );

ALTER TABLE "users" ALTER COLUMN "tester_level" SET DEFAULT 'trial'::"TesterProgramLevel";
