import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function checkSupabaseAdminConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

  return Boolean(
    supabaseUrl &&
    serviceRoleKey &&
    !serviceRoleKey.includes('your-service-role-key') &&
    !supabaseUrl.includes('your-supabase-url')
  );
}

export const isSupabaseAdminConfigured = checkSupabaseAdminConfigured();

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client initialized with the Service Role Key.
 * This client has administrative privileges (bypasses RLS and can manage auth.users).
 * NEVER expose this client or the service role key to the browser!
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!checkSupabaseAdminConfigured()) {
    return null;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return cachedAdminClient;
}

