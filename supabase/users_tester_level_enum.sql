-- Opțional: rulează în Supabase SQL Editor dacă tabelul `users` există doar acolo
-- și coloana `tester_level` e încă TEXT — vei primi dropdown pentru nivel în Table Editor.
-- Dacă ai deja rulat migrarea Prisma `20260503180000_tester_program_level_enum` pe același DB, sari peste.

DO $$
BEGIN
  CREATE TYPE "TesterProgramLevel" AS ENUM ('trial', 'tester', 'advanced', 'lead');
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

ALTER TABLE public.users ALTER COLUMN tester_level DROP DEFAULT;

ALTER TABLE public.users
  ALTER COLUMN tester_level TYPE "TesterProgramLevel"
  USING (
    CASE LOWER(TRIM(COALESCE(tester_level::text, '')))
      WHEN 'tester' THEN 'tester'::"TesterProgramLevel"
      WHEN 'advanced' THEN 'advanced'::"TesterProgramLevel"
      WHEN 'lead' THEN 'lead'::"TesterProgramLevel"
      ELSE 'trial'::"TesterProgramLevel"
    END
  );

ALTER TABLE public.users ALTER COLUMN tester_level SET DEFAULT 'trial'::"TesterProgramLevel";
