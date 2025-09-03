-- Create competitions table
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  description text,
  type text not null check (type in ('weight_loss', 'measurement')),
  measurement_type text check (measurement_type in ('waist', 'chest', 'arms', 'legs', 'hips')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  check (end_date > start_date),
  check (type = 'weight_loss' or measurement_type is not null)
);

-- Enable RLS
alter table public.competitions enable row level security;

-- RLS Policies for competitions
create policy "competitions_select_group_members"
  on public.competitions for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = competitions.group_id and gm.user_id = auth.uid()
    )
  );

create policy "competitions_insert_group_admin"
  on public.competitions for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from group_members gm
      where gm.group_id = competitions.group_id 
      and gm.user_id = auth.uid() 
      and gm.role = 'admin'
    )
  );

create policy "competitions_update_creator"
  on public.competitions for update
  using (auth.uid() = created_by);

create policy "competitions_delete_creator"
  on public.competitions for delete
  using (auth.uid() = created_by);
