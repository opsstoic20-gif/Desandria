import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireServiceRole } from "@/lib/env";

/**
 * Service-role Supabase client — bypasses RLS. Admin/service operations only
 * (desandria.md §5.6: admin via service role only). NEVER expose to the
 * browser. Lazy so the app boots without the secret; throws when used unset.
 *
 * Does not persist sessions — it is not a user-facing auth client.
 */
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  _admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    requireServiceRole(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return _admin;
}
