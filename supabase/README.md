# LocalGuide Supabase Setup

## Database Schema

The database schema is organized into migration files for easy deployment and version control.

### Running the Schema

Execute the migration files in order in your Supabase SQL Editor:

1. **Initial Schema** (`migrations/001_initial_schema.sql`)
   - Creates all tables (profiles, locals, chats, messages, etc.)
   - Sets up triggers for timestamp updates
   - Inserts predefined tags

2. **RLS Policies** (`migrations/002_rls_policies.sql`)
   - Implements Row Level Security policies
   - Ensures proper data isolation between users

3. **Storage Policies** (`migrations/003_storage_policies.sql`)
   - Sets up avatar upload policies
   - Configures storage bucket permissions

4. **Search Queries** (`migrations/004_search_queries.sql`)
   - Creates indexes for optimal search performance
   - Adds full-text search capabilities

### Steps to Deploy

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste each migration file content in order
3. Execute each migration
4. Verify tables are created in Table Editor
5. Test RLS policies are working correctly

### Important Notes

- **RLS is enforced** - all tables have strict Row Level Security
- **Auth integration** - profiles table is automatically populated via trigger
- **Real-time enabled** - messages table supports real-time subscriptions
- **Storage configured** - avatar uploads are properly secured

The schema supports the full LocalGuide feature set with proper security and performance optimizations.