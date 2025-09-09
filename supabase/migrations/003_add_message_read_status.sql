-- Add is_read column to messages table
alter table public.messages 
add column if not exists is_read boolean not null default false;

-- Add index for better performance on read status queries
create index if not exists idx_messages_is_read on public.messages(chat_id, is_read) where not is_read;