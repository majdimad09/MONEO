import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Strip any accidental path suffix — only the origin (https://<ref>.supabase.co) is valid.
let url: string | undefined;
try {
  url = rawUrl ? new URL(rawUrl).origin : undefined;
} catch {
  url = undefined;
}

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
