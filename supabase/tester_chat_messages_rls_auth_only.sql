-- RLS minimal pentru tester_messages când NU există tabelul public.users în același Postgres
-- (ex.: Supabase Auth separat de baza Prisma). Accesul la ruta /tester/chat rămâne filtrat în app.
--
-- Rulează DOAR dacă:
--   - ai creat deja public.tester_messages (din tester_chat_messages.sql, fără politicile care dau eroare), sau
--   - ai rulat tot tester_chat_messages.sql și vrei să înlocuiești politicile.
--
-- Șterge politicile vechi (ambele nume posibile) și creează varianta permisivă:

begin;

drop policy if exists "tester_messages_select_tester" on public.tester_messages;
drop policy if exists "tester_messages_insert_own_tester" on public.tester_messages;

create policy "tester_messages_select_authenticated"
on public.tester_messages
for select
to authenticated
using (true);

create policy "tester_messages_insert_own_row"
on public.tester_messages
for insert
to authenticated
with check (auth.uid() = user_id);

commit;
