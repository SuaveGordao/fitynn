-- Create posts table for social feed
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  photo_url text,
  measurement_id uuid references public.measurements(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.posts enable row level security;

-- RLS Policies for posts
create policy "posts_select_group_members"
  on public.posts for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = posts.group_id and gm.user_id = auth.uid()
    )
  );

create policy "posts_insert_own"
  on public.posts for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from group_members gm
      where gm.group_id = posts.group_id and gm.user_id = auth.uid()
    )
  );

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = user_id);
