-- Conversie users.tester_level: TEXT → enum "TesterProgramLevel" (dropdown în Supabase).
--
-- IMPORTANT: dacă există politici RLS pe `tester_messages` care folosesc `users.tester_level`,
-- Postgres refuză ALTER TYPE până nu sunt șterse temporar. Acest script le dă jos și le pune la loc.

begin;

-- Politici care depind de coloana tester_level (din tester_chat_messages_rls_levels.sql)
drop policy if exists "tester_messages_insert_own_tester" on public.tester_messages;
drop policy if exists "tester_messages_delete_moderators" on public.tester_messages;
drop policy if exists "tester_messages_update_lead_admin" on public.tester_messages;

do $$
begin
  create type "TesterProgramLevel" as enum ('trial', 'tester', 'advanced', 'lead');
exception
  when duplicate_object then
    null;
end $$;

alter table public.users alter column tester_level drop default;

alter table public.users
  alter column tester_level type "TesterProgramLevel"
  using (
    case lower(trim(coalesce(tester_level::text, '')))
      when 'tester' then 'tester'::"TesterProgramLevel"
      when 'advanced' then 'advanced'::"TesterProgramLevel"
      when 'lead' then 'lead'::"TesterProgramLevel"
      else 'trial'::"TesterProgramLevel"
    end
  );

alter table public.users alter column tester_level set default 'trial'::"TesterProgramLevel";

-- Repunere politici (aceleași reguli; ::text pe enum e valid în Postgres)
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
        or coalesce(u."tester_level"::text, 'trial') in ('tester', 'advanced', 'lead')
      )
  )
);

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
        or coalesce(u."tester_level"::text, 'trial') in ('advanced', 'lead')
      )
  )
);

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
        or coalesce(u."tester_level"::text, 'trial') = 'lead'
      )
  )
)
with check (true);

commit;
