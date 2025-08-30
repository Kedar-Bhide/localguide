-- Search Queries and Helper Functions
-- Run this after the main schema and RLS policies

-- Function to search locals by city and tags
-- Example usage: SELECT * FROM search_locals('Paris', 'France', ARRAY['Museums', 'Foodie Spots']);
create or replace function public.search_locals(
  query_city text,
  query_country text,
  selected_tags text[] default '{}'::text[]
)
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  city text,
  state text,
  country text,
  bio text,
  tags text[],
  tag_overlap bigint,
  last_active_at timestamptz
)
language sql
stable
security definer
as $$
  select 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    l.city,
    l.state,
    l.country,
    l.bio,
    l.tags,
    (select count(*) from unnest(l.tags) t where t = any(selected_tags)) as tag_overlap,
    p.last_active_at
  from public.locals l
  join public.profiles p on p.id = l.user_id
  where 
    lower(l.city) = lower(query_city) 
    and lower(l.country) = lower(query_country)
  order by 
    tag_overlap desc nulls last, 
    p.last_active_at desc
  limit 50;
$$;

-- Function to get all available tags
create or replace function public.get_all_tags()
returns table (
  id bigint,
  name text
)
language sql
stable
security definer
as $$
  select id, name from public.tags order by name;
$$;

-- Function to get popular tags (based on usage by locals)
create or replace function public.get_popular_tags(limit_count int default 10)
returns table (
  tag_name text,
  usage_count bigint
)
language sql
stable
security definer
as $$
  select 
    t.name as tag_name,
    count(lt.user_id) as usage_count
  from public.tags t
  left join public.local_tags lt on t.id = lt.tag_id
  group by t.id, t.name
  order by usage_count desc, t.name
  limit limit_count;
$$;

-- Index for better search performance
create index if not exists idx_locals_city_country on public.locals (lower(city), lower(country));
create index if not exists idx_locals_tags on public.locals using gin (tags);
create index if not exists idx_profiles_last_active on public.profiles (last_active_at desc);

-- Index for chat performance
create index if not exists idx_messages_chat_created on public.messages (chat_id, created_at desc);
create index if not exists idx_chat_participants_user on public.chat_participants (user_id);
create index if not exists idx_chat_participants_chat on public.chat_participants (chat_id);