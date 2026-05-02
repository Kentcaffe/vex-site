-- Diagnostic: chat tester + nivel tester + RLS + Realtime
-- Rulează tot fișierul în Supabase SQL Editor (Run). Comentariile trebuie să înceapă cu două liniuțe: --
-- (Dacă copiezi o singură linie, asigură-te că începe cu SELECT, nu cu - singur.)

-- [1] Coloana users.tester_level
SELECT
  '1) Coloana public.users.tester_level' AS verificare,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = 'users'
        AND c.column_name = 'tester_level'
    )
    THEN 'OK - coloana există'
    ELSE 'LIPSEȘTE - rulează migrările Prisma sau ALTER TABLE'
  END AS rezultat;

SELECT
  '1b) Tip coloană tester_level (USER-DEFINED + TesterProgramLevel = enum)' AS verificare,
  coalesce(c.data_type, '(lipsește)') AS data_type,
  coalesce(c.udt_name::text, '-') AS udt_name,
  CASE
    WHEN c.data_type = 'USER-DEFINED' AND c.udt_name = 'TesterProgramLevel' THEN 'OK - e enum Postgres'
    WHEN c.data_type = 'text' THEN 'TEXT - încă nu ai rulat conversia la enum (users_tester_level_enum.sql)'
    WHEN c.column_name IS NULL THEN '-'
    ELSE 'Verifică manual'
  END AS rezultat
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'users'
  AND c.column_name = 'tester_level';

-- [2] Valori enum TesterProgramLevel
SELECT
  '2) Etichete enum TesterProgramLevel' AS verificare,
  string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS valori_așteptate_trial_tester_advanced_lead,
  CASE
    WHEN count(*) FILTER (WHERE e.enumlabel IN ('trial', 'tester', 'advanced', 'lead')) = 4
      AND count(*) = 4
    THEN 'OK'
    ELSE 'INCOMPLET sau enum lipsește'
  END AS rezultat
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname = 'TesterProgramLevel';

-- [3] Tabel tester_messages
SELECT
  '3) Tabel public.tester_messages' AS verificare,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_schema = 'public' AND t.table_name = 'tester_messages'
    )
    THEN 'OK'
    ELSE 'LIPSEȘTE - rulează tester_chat_messages.sql'
  END AS rezultat;

SELECT
  '3b) Coloane obligatorii în tester_messages' AS verificare,
  (SELECT string_agg(column_name, ', ' ORDER BY column_name)
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'tester_messages') AS coloane_gasite,
  CASE
    WHEN (
      SELECT count(*) FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tester_messages'
        AND column_name IN ('id', 'user_id', 'user', 'text', 'created_at')
    ) = 5
    THEN 'OK (id, user_id, user, text, created_at)'
    ELSE 'VERIFICĂ - lipsesc coloane'
  END AS rezultat;

-- [4] RLS activ pe tester_messages
SELECT
  '4) RLS activ pe tester_messages' AS verificare,
  CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'LIPSEȘTE - ALTER TABLE ... ENABLE ROW LEVEL SECURITY' END AS rezultat
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'tester_messages'
  AND c.relkind = 'r';

-- [5] Politici RLS pe tester_messages
SELECT
  '5) Politici pe tester_messages' AS verificare,
  coalesce(string_agg(p.polname, ', ' ORDER BY p.polname), '(niciuna)') AS politici,
  CASE
    WHEN count(*) FILTER (
      WHERE p.polname IN (
        'tester_messages_select_tester',
        'tester_messages_insert_own_tester'
      )
    ) >= 1
    THEN 'OK (minim select + insert; delete/update dacă ai rulat rls_levels)'
    ELSE 'LIPSEȘTE - rulează tester_chat_messages.sql și eventual tester_chat_messages_rls_levels.sql'
  END AS rezultat
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'tester_messages';

-- [6] Realtime publicație supabase_realtime
SELECT
  '6) Tabel în publicația supabase_realtime' AS verificare,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables pt
      WHERE pt.pubname = 'supabase_realtime'
        AND pt.schemaname = 'public'
        AND pt.tablename = 'tester_messages'
    )
    THEN 'OK - mesajele apar live'
    ELSE 'LIPSEȘTE - parte din tester_chat_messages.sql (ALTER PUBLICATION)'
  END AS rezultat;

-- [7] Distribuție rapidă nivel + mesaje
SELECT '7) Câți useri pe tester_level' AS verificare, tester_level::text AS nivel, count(*) AS cnt
FROM public.users
GROUP BY tester_level
ORDER BY cnt DESC;

SELECT '8) Câte rânduri în tester_messages' AS verificare, count(*)::text AS total_mesaje
FROM public.tester_messages;

-- [9] Politica DELETE (fără ea, coșul din browser nu șterge nimic dacă folosești doar clientul)
SELECT
  '9) Politica DELETE tester_messages_delete_moderators' AS verificare,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = 'tester_messages'
        AND p.polname = 'tester_messages_delete_moderators'
    )
    THEN 'OK - ștergerea din client Supabase poate merge (dacă RLS îți permite)'
    ELSE 'LIPSEȘTE - rulează tester_chat_messages_rls_levels.sql sau users_tester_level_enum.sql (partea de CREATE POLICY delete)'
  END AS rezultat;
