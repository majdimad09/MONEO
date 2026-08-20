import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Supabase is optional — if credentials are missing, the app runs in guest-only mode.
const isConfigured =
  !!url && url !== 'https://your-project-ref.supabase.co' &&
  !!key && key !== 'your-anon-key-here';

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url!, key!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'cashly-auth',
      },
    })
  : null;

export const isSupabaseConfigured = isConfigured;
