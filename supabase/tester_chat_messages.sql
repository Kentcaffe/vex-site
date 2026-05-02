-- Tester community chat (separat de tabelul Prisma `messages` folosit pentru DM marketplace).
-- Coloane logice: id, user (nume afișat), text, created_at + user_id (legătură auth.uid() pentru RLS).
-- Rulează în Supabase SQL Editor după migrările Prisma.

begin;

create table if not exists public.tester_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  "user" text not null,
  "text" text not null,
  created_at timestamptz not null default now()
);

create index if not exists tester_messages_created_at_idx
  on public.tester_messages (created_at asc);

alter table public.tester_messages enable row level security;

-- Citire: utilizatori autentificați cu rol tester / moderator / admin în aplicația Prisma.
drop policy if exists "tester_messages_select_tester" on public.tester_messages;
create policy "tester_messages_select_tester"
on public.tester_messages
for select
to authenticated
using (
  exists (
    select 1
    from public."User" u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('tester', 'moderator', 'admin')
  )
);

-- Inserare: doar pentru propriul cont auth și același rol.
drop policy if exists "tester_messages_insert_own_tester" on public.tester_messages;
create policy "tester_messages_insert_own_tester"
on public.tester_messages
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public."User" u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('tester', 'moderator', 'admin')
  )
);

-- Realtime: evenimente INSERT pentru client.
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    begin
      execute 'alter publication supabase_realtime add table public.tester_messages';
    exception
      when duplicate_object then
        null;
    end;
  end if;
end $$;

commit;
