-- Create competition_participants table
create table if not exists public.competition_participants (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  initial_weight numeric(5,2),
  initial_measurement numeric(5,2),
  joined_at timestamptz default now() not null,
  unique(competition_id, user_id)
);

-- Enable RLS
alter table public.competition_participants enable row level security;

-- RLS Policies for competition_participants
create policy "competition_participants_select_group_members"
  on public.competition_participants for select
  using (
    exists (
      select 1 from competitions c
      join group_members gm on c.group_id = gm.group_id
      where c.id = competition_participants.competition_id and gm.user_id = auth.uid()
    )
  );

create policy "competition_participants_insert_own"
  on public.competition_participants for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from competitions c
      join group_members gm on c.group_id = gm.group_id
      where c.id = competition_participants.competition_id and gm.user_id = auth.uid()
    )
  );

create policy "competition_participants_update_own"
  on public.competition_participants for update
  using (auth.uid() = user_id);

create policy "competition_participants_delete_own"
  on public.competition_participants for delete
  using (auth.uid() = user_id);
