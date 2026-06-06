-- ===========================================================================
-- SmokeTrace database schema
-- ---------------------------------------------------------------------------
-- Run this file in the Supabase SQL Editor (or via the Supabase CLI) to
-- provision every table, index, row-level-security policy and trigger the
-- application relies on. The script is idempotent enough to re-run during
-- development, but in production prefer the Supabase migration workflow.
-- ===========================================================================

-- Required extensions ------------------------------------------------------
create extension if not exists "pgcrypto";

-- ===========================================================================
-- profiles
-- One row per authenticated user. Mirrors auth.users and stores app-level
-- profile data + onboarding status.
-- ===========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  username text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- user_quit_profiles
-- The personalized quit plan generated during onboarding.
-- ===========================================================================
create table if not exists public.user_quit_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  smoking_frequency text,
  cigarettes_per_day integer,
  years_smoking integer,
  cigarette_type text,
  quit_goal text,
  quit_date date,
  stress_level integer,
  common_triggers text[],
  previous_quit_attempts integer,
  cost_per_pack numeric,
  cigarettes_per_pack integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_quit_profiles_user_id_idx
  on public.user_quit_profiles (user_id);

-- ===========================================================================
-- cravings
-- Each logged craving event with context for risk scoring.
-- ===========================================================================
create table if not exists public.cravings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  intensity integer check (intensity between 1 and 10),
  mood text,
  stress_level integer check (stress_level between 1 and 10),
  sleep_quality integer check (sleep_quality between 1 and 10),
  location_label text,
  trigger_type text,
  notes text,
  outcome text check (outcome in ('resisted', 'smoked', 'still_craving')),
  created_at timestamptz not null default now()
);

create index if not exists cravings_user_id_created_at_idx
  on public.cravings (user_id, created_at desc);

-- ===========================================================================
-- smoking_events
-- Recorded relapses / cigarettes smoked.
-- ===========================================================================
create table if not exists public.smoking_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cigarettes_count integer not null default 1,
  trigger_type text,
  location_label text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists smoking_events_user_id_created_at_idx
  on public.smoking_events (user_id, created_at desc);

-- ===========================================================================
-- interventions
-- Recommended / delivered interventions and their feedback.
-- ===========================================================================
create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  craving_id uuid references public.cravings (id) on delete set null,
  type text,
  message text,
  completed boolean not null default false,
  helpful boolean,
  created_at timestamptz not null default now()
);

create index if not exists interventions_user_id_created_at_idx
  on public.interventions (user_id, created_at desc);

-- ===========================================================================
-- trigger_locations
-- User-managed list of high-risk places.
-- ===========================================================================
create table if not exists public.trigger_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text,
  address text,
  latitude numeric,
  longitude numeric,
  radius_meters integer not null default 100,
  risk_level integer not null default 5,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trigger_locations_user_id_idx
  on public.trigger_locations (user_id);

-- ===========================================================================
-- accountability_contacts
-- People the user can lean on during a craving.
-- ===========================================================================
create table if not exists public.accountability_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text,
  email text,
  phone text,
  relationship text,
  notify_on_emergency boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists accountability_contacts_user_id_idx
  on public.accountability_contacts (user_id);

-- ===========================================================================
-- coach_messages
-- Full transcript of AI coach conversations.
-- ===========================================================================
create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_id_created_at_idx
  on public.coach_messages (user_id, created_at);

-- ===========================================================================
-- achievements
-- Gamified milestones unlocked by the user.
-- ===========================================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_key text,
  title text,
  description text,
  unlocked_at timestamptz not null default now()
);

create index if not exists achievements_user_id_idx
  on public.achievements (user_id);

-- ===========================================================================
-- updated_at trigger for user_quit_profiles
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_quit_profiles_updated_at on public.user_quit_profiles;
create trigger set_user_quit_profiles_updated_at
  before update on public.user_quit_profiles
  for each row
  execute function public.set_updated_at();

-- ===========================================================================
-- New-user trigger: automatically create a profile row when a user signs up.
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
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

-- ===========================================================================
-- Row Level Security
-- Every user-owned table: the authenticated user may only touch their rows.
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.user_quit_profiles enable row level security;
alter table public.cravings enable row level security;
alter table public.smoking_events enable row level security;
alter table public.interventions enable row level security;
alter table public.trigger_locations enable row level security;
alter table public.accountability_contacts enable row level security;
alter table public.coach_messages enable row level security;
alter table public.achievements enable row level security;

-- profiles: id IS the auth uid -----------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Helper: generate the four standard policies for a user_id-owned table.
-- (Supabase has no loop construct in plain SQL, so we spell each one out.)

-- user_quit_profiles ---------------------------------------------------------
drop policy if exists "uqp_all_own" on public.user_quit_profiles;
create policy "uqp_all_own" on public.user_quit_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cravings -------------------------------------------------------------------
drop policy if exists "cravings_all_own" on public.cravings;
create policy "cravings_all_own" on public.cravings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- smoking_events -------------------------------------------------------------
drop policy if exists "smoking_events_all_own" on public.smoking_events;
create policy "smoking_events_all_own" on public.smoking_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- interventions --------------------------------------------------------------
drop policy if exists "interventions_all_own" on public.interventions;
create policy "interventions_all_own" on public.interventions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trigger_locations ----------------------------------------------------------
drop policy if exists "trigger_locations_all_own" on public.trigger_locations;
create policy "trigger_locations_all_own" on public.trigger_locations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- accountability_contacts ----------------------------------------------------
drop policy if exists "accountability_contacts_all_own" on public.accountability_contacts;
create policy "accountability_contacts_all_own" on public.accountability_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- coach_messages -------------------------------------------------------------
drop policy if exists "coach_messages_all_own" on public.coach_messages;
create policy "coach_messages_all_own" on public.coach_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- achievements ---------------------------------------------------------------
drop policy if exists "achievements_all_own" on public.achievements;
create policy "achievements_all_own" on public.achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- Done. After running this, enable Email auth in Supabase Auth settings.
-- ===========================================================================
