import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Initialize Supabase client with service role key for backend operations
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize client-side Supabase for auth operations
export const supabaseAuth = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);