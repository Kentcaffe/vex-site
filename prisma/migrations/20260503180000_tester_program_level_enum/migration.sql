-- tester_level: TEXT → enum Postgres. Politici RLS pe tester_messages care citesc users.tester_level
-- trebuie scoase temporar, altfel: „cannot alter type of a column used in a policy definition”.

DROP POLICY IF EXISTS "tester_messages_insert_own_tester" ON public.tester_messages;
DROP POLICY IF EXISTS "tester_messages_delete_moderators" ON public.tester_messages;
DROP POLICY IF EXISTS "tester_messages_update_lead_admin" ON public.tester_messages;

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

CREATE POLICY "tester_messages_insert_own_tester"
ON public.tester_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u."supabaseAuthId" = auth.uid()::text
      AND lower(u.role::text) IN ('tester', 'moderator', 'admin')
      AND (
        lower(u.role::text) IN ('moderator', 'admin')
        OR coalesce(u."tester_level"::text, 'trial') IN ('tester', 'advanced', 'lead')
      )
  )
);

CREATE POLICY "tester_messages_delete_moderators"
ON public.tester_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u."supabaseAuthId" = auth.uid()::text
      AND (
        lower(u.role::text) = 'admin'
        OR lower(u.role::text) = 'moderator'
        OR coalesce(u."tester_level"::text, 'trial') IN ('advanced', 'lead')
      )
  )
);

CREATE POLICY "tester_messages_update_lead_admin"
ON public.tester_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u."supabaseAuthId" = auth.uid()::text
      AND (
        lower(u.role::text) = 'admin'
        OR coalesce(u."tester_level"::text, 'trial') = 'lead'
      )
  )
)
WITH CHECK (true);
