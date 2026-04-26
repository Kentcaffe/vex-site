-- Tester Dashboard schema + security
-- Run in Supabase SQL editor.

create table if not exists public.bugs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  page_url text,
  browser_info text,
  device_info text,
  reproducibility text,
  image_url text,
  image_urls text[] not null default '{}',
  category text not null check (category in ('ui', 'functional', 'security')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected')),
  reward numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.bugs add column if not exists steps_to_reproduce text;
alter table public.bugs add column if not exists expected_result text;
alter table public.bugs add column if not exists actual_result text;
alter table public.bugs add column if not exists page_url text;
alter table public.bugs add column if not exists browser_info text;
alter table public.bugs add column if not exists device_info text;
alter table public.bugs add column if not exists reproducibility text;
alter table public.bugs add column if not exists image_urls text[] not null default '{}';

create index if not exists bugs_user_id_idx on public.bugs(user_id);
create index if not exists bugs_status_idx on public.bugs(status);
create index if not exists bugs_created_at_idx on public.bugs(created_at desc);

alter table public.bugs enable row level security;

drop policy if exists "bugs_select_own_or_admin" on public.bugs;
create policy "bugs_select_own_or_admin"
on public.bugs
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and u.role = 'ADMIN'
  )
);

drop policy if exists "bugs_insert_tester_or_admin" on public.bugs;
create policy "bugs_insert_tester_or_admin"
on public.bugs
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

drop policy if exists "bugs_update_admin_only" on public.bugs;
create policy "bugs_update_admin_only"
on public.bugs
for update
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and u.role = 'ADMIN'
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and u.role = 'ADMIN'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bugs', 'bugs', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "bugs_bucket_read_public" on storage.objects;
create policy "bugs_bucket_read_public"
on storage.objects
for select
to public
using (bucket_id = 'bugs');

drop policy if exists "bugs_bucket_upload_tester_or_admin" on storage.objects;
create policy "bugs_bucket_upload_tester_or_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'bugs'
  and exists (
    select 1
    from public.users u
    where u."supabaseAuthId" = auth.uid()::text
      and lower(u.role::text) in ('tester', 'moderator', 'admin')
  )
);

