-- Storage Bucket Policies for Avatars
-- Run this in Supabase SQL Editor AFTER creating the avatars bucket

-- Note: The avatars bucket should be created manually in Supabase Storage UI first
-- Bucket name: 'avatars'
-- Public bucket: ON
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies are created in the Storage UI, but here's the SQL equivalent for reference:

-- READ POLICY (allow public read access to avatar images)
-- This allows anyone to view avatar images (needed for public profile cards)
create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

-- WRITE POLICY (authenticated users can upload their own avatars only)
-- Users can only upload/update/delete files in their own folder: user_id/filename
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Helper function to generate avatar URLs in queries
-- Usage: SELECT get_avatar_url(avatar_url) FROM profiles WHERE id = auth.uid();
create or replace function public.get_avatar_url(avatar_path text)
returns text
language sql
stable
as $$
  select 
    case 
      when avatar_path is null or avatar_path = '' then null
      else (select url from storage.buckets where name = 'avatars') || '/object/public/avatars/' || avatar_path
    end
$$;