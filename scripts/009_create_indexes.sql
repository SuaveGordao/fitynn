-- Create indexes for better performance
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_competitions_group_id on public.competitions(group_id);
create index if not exists idx_competition_participants_competition_id on public.competition_participants(competition_id);
create index if not exists idx_competition_participants_user_id on public.competition_participants(user_id);
create index if not exists idx_measurements_competition_id on public.measurements(competition_id);
create index if not exists idx_measurements_user_id on public.measurements(user_id);
create index if not exists idx_posts_group_id on public.posts(group_id);
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_invited_user_id on public.group_invitations(invited_user_id);
create index if not exists idx_group_invitations_invited_email on public.group_invitations(invited_email);
