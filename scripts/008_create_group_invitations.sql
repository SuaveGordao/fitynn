-- Create group_invitations table
create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  invited_user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now() not null,
  unique(group_id, invited_email)
);

-- Enable RLS
alter table public.group_invitations enable row level security;

-- RLS Policies for group_invitations
create policy "group_invitations_select_invited_or_group_member"
  on public.group_invitations for select
  using (
    invited_user_id = auth.uid() or
    exists (
      select 1 from group_members gm
      where gm.group_id = group_invitations.group_id and gm.user_id = auth.uid()
    )
  );

create policy "group_invitations_insert_group_admin"
  on public.group_invitations for insert
  with check (
    auth.uid() = invited_by and
    exists (
      select 1 from group_members gm
      where gm.group_id = group_invitations.group_id 
      and gm.user_id = auth.uid() 
      and gm.role = 'admin'
    )
  );

create policy "group_invitations_update_invited"
  on public.group_invitations for update
  using (invited_user_id = auth.uid());

create policy "group_invitations_delete_invited_or_admin"
  on public.group_invitations for delete
  using (
    invited_user_id = auth.uid() or
    exists (
      select 1 from group_members gm
      where gm.group_id = group_invitations.group_id 
      and gm.user_id = auth.uid() 
      and gm.role = 'admin'
    )
  );
