import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  // During build / test we may not have env vars; throw a helpful error only when running
  // in dev it will advertise missing env vars.
  // We avoid throwing at import time to keep server tooling happy.
  // Consumers should check process.env when running.
}

export const supabase: SupabaseClient = createClient(url, anonKey, {
  // default options for browser client
});

export const createSupabaseAdmin = () => {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRole) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
