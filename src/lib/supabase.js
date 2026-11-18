
import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
