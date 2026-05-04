-- Opțional: rulează manual în Supabase SQL Editor dacă folosești migrații doar din Prisma.
-- Aliniează cu prisma/migrations/20260504120000_tester_activity/migration.sql

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.tester_activity (
  id text PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  last_login timestamptz,
  sessions_count integer NOT NULL DEFAULT 0,
  total_time_spent integer NOT NULL DEFAULT 0,
  last_active timestamptz,
  last_path text,
  recent_paths jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tester_activity_last_active_idx ON public.tester_activity (last_active DESC NULLS LAST);
