import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — Auth only (desandria.md locked arch: supabase-js
 * for Auth, Drizzle for all data access).
 *
 * URL + anon/publishable key are public by Supabase design (safe in the
 * browser; RLS protects data), hence `NEXT_PUBLIC_`. The `service_role` secret
 * is NEVER used here — see src/lib/supabase/admin.ts (server-only).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
