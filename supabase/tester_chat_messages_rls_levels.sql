-- Actualizare RLS pentru tester_messages ținând cont de users.tester_level.
-- Rulează în Supabase după migrarea Prisma care adaugă coloana tester_level pe public.users.
--
-- Permisiuni:
--   SELECT: neschimbat (tester/moderator/admin ca înainte)
--   INSERT: trial nu poate; tester/advanced/lead da; moderator/admin mereu
--   DELETE: advanced, lead, sau admin (moderare mesaje)
--   UPDATE: lead sau admin (moderare conținut mesaj; moderator poate șterge, nu edita)

begin;

alter table public.users
  add column if not exists "tester_level" text not null default 'trial';

drop policy if exists "tester_messages_insert_own_tester" on public.tester_messages;
create policy "tester_messages_insert_own_tester"
on public.tester_messages
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('tester', 'moderator', 'admin')
      and (
        lower(u.role::text) in ('moderator', 'admin')
        or coalesce(u."tester_level", 'trial') in ('tester', 'advanced', 'lead')
      )
  )
);

drop policy if exists "tester_messages_delete_moderators" on public.tester_messages;
create policy "tester_messages_delete_moderators"
on public.tester_messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and (
        lower(u.role::text) = 'admin'
        or lower(u.role::text) = 'moderator'
        or coalesce(u."tester_level", 'trial') in ('advanced', 'lead')
      )
  )
);

drop policy if exists "tester_messages_update_lead_admin" on public.tester_messages;
create policy "tester_messages_update_lead_admin"
on public.tester_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and (
        lower(u.role::text) = 'admin'
        or coalesce(u."tester_level", 'trial') = 'lead'
      )
  )
)
with check (true);

commit;
