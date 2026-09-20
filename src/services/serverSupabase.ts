import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

const FALLBACK_SUPABASE_URL = 'https://xcisrhikagtpuqwseoqq.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaXNyaGlrYWd0cHVxd3Nlb3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODQzOTAsImV4cCI6MjEwNTA2MDM5MH0.t4nk9kYFu8pRJ5cRNfwCD81I0OYTsdLboyR5h3hTUhI';

/**
 * Returns a Supabase client configured for server-side operations.
 * Prefers SUPABASE_SERVICE_ROLE_KEY for administrative bypass of RLS,
 * then VITE_SUPABASE_ANON_KEY from environment, and finally known project credentials.
 */
export function getServerSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  let supabaseUrl = '';
  let serviceKey = '';

  if (typeof process !== 'undefined' && process.env) {
    supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    // If missing in process.env, attempt to read from .env.local or .env
    if (!supabaseUrl || !serviceKey) {
      try {
        const fs = typeof require !== 'undefined' ? require('fs') : null;
        if (fs) {
          const files = ['.env.local', '.env'];
          for (const f of files) {
            if (fs.existsSync(f)) {
              const content = fs.readFileSync(f, 'utf8');
              const lines = content.split('\n');
              for (const line of lines) {
                const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                  const key = match[1];
                  const value = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
                  if (!process.env[key]) process.env[key] = value;
                }
              }
            }
          }
          supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
          serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
        }
      } catch {}
    }
  }

  const effectiveUrl = supabaseUrl || FALLBACK_SUPABASE_URL;
  const effectiveKey = serviceKey || FALLBACK_SUPABASE_KEY;

  cachedClient = createClient(effectiveUrl, effectiveKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
