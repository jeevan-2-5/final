import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if the credentials are set and are not placeholder values
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder-project-url')
);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

// Fallback to placeholder credentials if missing so that createClient does not crash the app load
const finalUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project-url.supabase.co';
const finalKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MjUwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

