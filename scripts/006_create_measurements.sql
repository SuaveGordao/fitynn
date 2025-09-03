-- Create measurements table
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric(5,2),
  measurement_value numeric(5,2),
  photo_url text,
  recorded_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.measurements enable row level security;

-- RLS Policies for measurements
create policy "measurements_select_group_members"
  on public.measurements for select
  using (
    exists (
      select 1 from competitions c
      join group_members gm on c.group_id = gm.group_id
      where c.id = measurements.competition_id and gm.user_id = auth.uid()
    )
  );

create policy "measurements_insert_own"
  on public.measurements for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from competition_participants cp
      where cp.competition_id = measurements.competition_id and cp.user_id = auth.uid()
    )
  );

create policy "measurements_update_own"
  on public.measurements for update
  using (auth.uid() = user_id);

create policy "measurements_delete_own"
  on public.measurements for delete
  using (auth.uid() = user_id);
