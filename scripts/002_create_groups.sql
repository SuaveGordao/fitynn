-- Create groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.groups enable row level security;

-- RLS Policies for groups
create policy "groups_select_members"
  on public.groups for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );

create policy "groups_insert_own"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "groups_update_creator"
  on public.groups for update
  using (auth.uid() = created_by);

create policy "groups_delete_creator"
  on public.groups for delete
  using (auth.uid() = created_by);
