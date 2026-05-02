-- Tester community chat (separat de tabelul Prisma `messages` folosit pentru DM marketplace).
-- Coloane: id, user (nume afișat), text, created_at + user_id → auth.users.
-- Modelul Prisma `User` este mapat la tabelul **public.users** (@@map("users")), nu "User".
-- Rulează în Supabase SQL Editor.
--
-- După ce există coloana users.tester_level (migrare Prisma), aplică și politicile pe nivel:
--   supabase/tester_chat_messages_rls_levels.sql
--
-- Dacă primești „relation public.users does not exist” (Postgres Supabase fără migrări Prisma),
-- rulează în schimb: supabase/tester_chat_messages_rls_auth_only.sql (după ce există deja tabelul
-- tester_messages — poți rula mai întâi acest fișier până la «alter table … enable row level security»,
-- apoi politicile din fișierul auth_only).

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

-- Citire: autentificat + rând în public.users legat de Supabase + rol tester/moderator/admin.
drop policy if exists "tester_messages_select_tester" on public.tester_messages;
create policy "tester_messages_select_tester"
on public.tester_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('tester', 'moderator', 'admin')
  )
);

-- Inserare: doar în numele propriului auth.uid() + același rol.
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
