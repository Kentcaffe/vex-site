-- Publică INSERT-uri pe ChatMessage pentru Supabase Realtime (marketplace chat).
-- Rulează pe același Postgres ca Prisma (ex. Supabase → SQL Editor).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE "ChatMessage"';
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
    END;
  END IF;
END $$;
