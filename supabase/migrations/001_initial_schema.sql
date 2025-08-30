-- LocalGuide Database Schema
-- Run this in Supabase SQL Editor

-- 1) PROFILES (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  is_traveler boolean not null default true,
  is_local boolean not null default false,
  avatar_url text,
  last_active_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) LOCALS (local-only info; exists only if is_local=true)
create table if not exists public.locals (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  city text not null,
  state text,
  country text not null,
  bio text not null,
  tags text[] not null default '{}', -- also mirrored via join table below for ranking; array simplifies reads
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) TAGS (fixed list)
create table if not exists public.tags (
  id bigserial primary key,
  name text unique not null
);

-- 4) LOCAL_TAGS (for analytics/ranking flexibility)
create table if not exists public.local_tags (
  user_id uuid references public.locals(user_id) on delete cascade,
  tag_id bigint references public.tags(id) on delete cascade,
  primary key (user_id, tag_id)
);

-- 5) SEARCHES (traveler search logs)
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  query_city text not null,
  query_state text,
  query_country text not null,
  start_date date,
  end_date date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 6) CHATS (conversation container)
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

-- 7) CHAT_PARTICIPANTS (many-to-many users ↔ chats)
create table if not exists public.chat_participants (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('traveler','local')) not null,
  primary key (chat_id, user_id)
);

-- 8) MESSAGES
create table if not exists public.messages (
  id bigserial primary key,
  chat_id uuid references public.chats(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 9) FEEDBACK (anonymous insert allowed; no public read)
create table if not exists public.feedback (
  id bigserial primary key,
  name text not null,
  email text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

-- 10) ADMIN (optional; link admins to users)
create table if not exists public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Update triggers for timestamps
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger locals_touch
before update on public.locals
for each row execute function public.touch_updated_at();

-- Insert predefined tags
insert into public.tags(name) values
  ('Hiking'), ('Nightlife'), ('Budget-friendly'), ('Museums'), ('Foodie Spots'),
  ('Local Markets'), ('Historical Sites'), ('Beaches'), ('Nature & Parks'),
  ('Photography'), ('Art & Culture'), ('Live Music'), ('Bars & Pubs'),
  ('Coffee & Cafes'), ('Family-friendly'), ('Hidden Gems'), ('Architecture'),
  ('Road Trips'), ('Public Transit Tips'), ('Shopping'), ('Festivals'),
  ('Outdoor Sports'), ('Wellness & Spas'), ('Day Trips')
on conflict do nothing;