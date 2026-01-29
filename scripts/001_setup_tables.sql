-- PUBG Scrim Platform - Supabase Migration
-- This script creates all tables needed for the platform

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  role text not null default 'GUEST' check (role in ('GUEST', 'MANAGER', 'ADMIN', 'FOUNDER')),
  last_case_open timestamptz,
  vip_until timestamptz,
  created_at timestamptz not null default now()
);

-- Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null,
  leader_id uuid not null references public.profiles(id) on delete cascade unique,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'BLOCKED', 'REJECTED')),
  is_vip boolean not null default false,
  player_count integer not null default 4,
  maps_count integer not null default 0,
  block_reason text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Scrims table
create table if not exists public.scrims (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  map text not null,
  max_teams integer not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED', 'FINISHED')),
  room_id text,
  room_pass text,
  created_at timestamptz not null default now()
);

-- Slots table
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  slot_number integer not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  scrim_id uuid not null references public.scrims(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(scrim_id, slot_number),
  unique(scrim_id, team_id)
);

-- Results table
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  description text,
  scrim_id uuid not null references public.scrims(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- System config table
create table if not exists public.system_config (
  key text primary key,
  value text not null
);

-- Audit logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  user_id text not null,
  username text not null,
  details text,
  created_at timestamptz not null default now()
);

-- Case rewards table
create table if not exists public.case_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  type text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.scrims enable row level security;
alter table public.slots enable row level security;
alter table public.results enable row level security;
alter table public.system_config enable row level security;
alter table public.audit_logs enable row level security;
alter table public.case_rewards enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_admin_update" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for teams
create policy "teams_select_all" on public.teams for select using (true);
create policy "teams_insert_own" on public.teams for insert with check (auth.uid() = leader_id);
create policy "teams_update_own" on public.teams for update using (auth.uid() = leader_id);
create policy "teams_delete_own" on public.teams for delete using (auth.uid() = leader_id);
create policy "teams_admin_all" on public.teams for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for scrims (public read, admin write)
create policy "scrims_select_all" on public.scrims for select using (true);
create policy "scrims_admin_all" on public.scrims for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for slots
create policy "slots_select_all" on public.slots for select using (true);
create policy "slots_insert_team_leader" on public.slots for insert with check (
  exists (select 1 from public.teams where id = team_id and leader_id = auth.uid())
);
create policy "slots_delete_team_leader" on public.slots for delete using (
  exists (select 1 from public.teams where id = team_id and leader_id = auth.uid())
);
create policy "slots_admin_all" on public.slots for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for results
create policy "results_select_all" on public.results for select using (true);
create policy "results_admin_all" on public.results for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for system_config
create policy "system_config_select_all" on public.system_config for select using (true);
create policy "system_config_admin_all" on public.system_config for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- RLS Policies for audit_logs
create policy "audit_logs_select_admin" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);
create policy "audit_logs_insert_authenticated" on public.audit_logs for insert with check (auth.uid() is not null);

-- RLS Policies for case_rewards
create policy "case_rewards_select_own" on public.case_rewards for select using (user_id = auth.uid());
create policy "case_rewards_insert_own" on public.case_rewards for insert with check (user_id = auth.uid());
create policy "case_rewards_admin_all" on public.case_rewards for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('ADMIN', 'FOUNDER'))
);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    'GUEST'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for teams updated_at
drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at
  before update on public.teams
  for each row
  execute function public.update_updated_at();

-- Insert default system config
insert into public.system_config (key, value) values ('registrationOpen', 'true')
on conflict (key) do nothing;
