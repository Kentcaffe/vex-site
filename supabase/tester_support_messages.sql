-- Chat suport individual tester <-> admin.
-- Ruleaza in Supabase SQL editor.

begin;

create table if not exists public.tester_support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  sender text not null check (sender in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists tester_support_messages_user_created_idx
  on public.tester_support_messages (user_id, created_at asc);

create index if not exists tester_support_messages_created_idx
  on public.tester_support_messages (created_at desc);

alter table public.tester_support_messages enable row level security;

-- Testerul vede doar mesajele lui.
drop policy if exists "tester_support_select_own" on public.tester_support_messages;
create policy "tester_support_select_own"
on public.tester_support_messages
for select
to authenticated
using (auth.uid() = user_id);

-- Testerul poate insera doar mesajele lui cu sender=user.
drop policy if exists "tester_support_insert_own_user" on public.tester_support_messages;
create policy "tester_support_insert_own_user"
on public.tester_support_messages
for insert
to authenticated
with check (auth.uid() = user_id and sender = 'user');

-- Admin/moderator pot vedea tot.
drop policy if exists "tester_support_select_admin_all" on public.tester_support_messages;
create policy "tester_support_select_admin_all"
on public.tester_support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('admin', 'moderator')
  )
);

-- Admin/moderator pot raspunde pe orice user_id.
drop policy if exists "tester_support_insert_admin" on public.tester_support_messages;
create policy "tester_support_insert_admin"
on public.tester_support_messages
for insert
to authenticated
with check (
  sender = 'admin'
  and exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('admin', 'moderator')
  )
);

-- Realtime.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.tester_support_messages';
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

commit;
