-- Row Level Security Policies
-- Run this AFTER running 001_initial_schema.sql

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.locals enable row level security;
alter table public.tags enable row level security;
alter table public.local_tags enable row level security;
alter table public.searches enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;
alter table public.admins enable row level security;

-- PROFILES POLICIES
-- READ: any authenticated user can read minimal profile fields (enables search), but no anon.
create policy "profiles_read_auth" on public.profiles
for select to authenticated
using (true);

-- WRITE: users can insert their own profile right after signup (via trigger or client)
create policy "profiles_insert_self" on public.profiles
for insert to authenticated
with check (id = auth.uid());

-- UPDATE: users can update only their row
create policy "profiles_update_self" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- LOCALS POLICIES
-- READ: all authenticated users can view locals (search results)
create policy "locals_read_auth" on public.locals
for select to authenticated
using (true);

-- INSERT: only the owner, and only if their profile is marked is_local
create policy "locals_insert_owner" on public.locals
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_local = true
  )
);

-- UPDATE: owner only
create policy "locals_update_owner" on public.locals
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- TAGS POLICIES
-- READ: authenticated users may read tags
create policy "tags_read_auth" on public.tags
for select to authenticated
using (true);
-- no insert/update/delete for non-admins

-- LOCAL_TAGS POLICIES
-- READ: authenticated users may read for ranking and display
create policy "local_tags_read_auth" on public.local_tags
for select to authenticated
using (true);

-- WRITE: owner only (ties to locals.user_id)
create policy "local_tags_write_owner" on public.local_tags
for insert to authenticated
with check (user_id = auth.uid());

create policy "local_tags_delete_owner" on public.local_tags
for delete to authenticated
using (user_id = auth.uid());

-- SEARCHES POLICIES
-- READ: users can see only their own past searches
create policy "searches_read_owner" on public.searches
for select to authenticated
using (user_id = auth.uid());

-- INSERT: owner only
create policy "searches_insert_owner" on public.searches
for insert to authenticated
with check (user_id = auth.uid());

-- CHATS POLICIES
-- READ: participant-only
create policy "chats_read_participant" on public.chats
for select to authenticated
using (exists (
  select 1 from public.chat_participants cp
  where cp.chat_id = chats.id and cp.user_id = auth.uid()
));

-- INSERT: allowed if the inserting client also inserts participants incl. self (enforced at app level)
create policy "chats_insert_auth" on public.chats
for insert to authenticated
with check (true);

-- CHAT_PARTICIPANTS POLICIES
-- READ: participants can read their chat memberships
create policy "chat_participants_read_participant" on public.chat_participants
for select to authenticated
using (user_id = auth.uid() or exists (
  select 1 from public.chat_participants cp2
  where cp2.chat_id = chat_participants.chat_id and cp2.user_id = auth.uid()
));

-- INSERT: user may add themselves only
create policy "chat_participants_insert_self" on public.chat_participants
for insert to authenticated
with check (user_id = auth.uid());

-- MESSAGES POLICIES
-- READ: only participants of the chat
create policy "messages_read_participant" on public.messages
for select to authenticated
using (exists (
  select 1 from public.chat_participants cp
  where cp.chat_id = messages.chat_id and cp.user_id = auth.uid()
));

-- INSERT: only participants may send, and sender must match
create policy "messages_send_participant" on public.messages
for insert to authenticated
with check (
  sender_id = auth.uid() and exists (
    select 1 from public.chat_participants cp
    where cp.chat_id = messages.chat_id and cp.user_id = auth.uid()
  )
);

-- FEEDBACK POLICIES
-- INSERT: allow anon and authenticated users to submit feedback
create policy "feedback_insert_any" on public.feedback
for insert to anon, authenticated
with check (true);

-- READ: no public read; admins only via service role or admin UI (server-side)
-- (no select policy for public roles)

-- ADMINS POLICIES
-- No public read/write; manage with service role only
-- (no policies for authenticated/anon)