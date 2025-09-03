-- Create group_members table
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- Enable RLS
alter table public.group_members enable row level security;

-- RLS Policies for group_members
create policy "group_members_select_own"
  on public.group_members for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "group_members_insert_admin"
  on public.group_members for insert
  with check (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id 
      and gm.user_id = auth.uid() 
      and gm.role = 'admin'
    )
    or
    exists (
      select 1 from groups g
      where g.id = group_members.group_id and g.created_by = auth.uid()
    )
  );

create policy "group_members_delete_admin_or_self"
  on public.group_members for delete
  using (
    user_id = auth.uid() or
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id 
      and gm.user_id = auth.uid() 
      and gm.role = 'admin'
    )
  );
