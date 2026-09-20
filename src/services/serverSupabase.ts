import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client configured for server-side operations.
 * Prefers SUPABASE_SERVICE_ROLE_KEY for administrative bypass of RLS,
 * but falls back gracefully to VITE_SUPABASE_ANON_KEY.
 */
export function getServerSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const env = typeof process !== 'undefined' ? process.env : {};
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    console.warn('[DriverBee Server Supabase] Warning: Missing SUPABASE_URL or API keys in environment.');
  }

  cachedClient = createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceKey || 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
