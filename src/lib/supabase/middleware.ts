import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and keeps the browser's
 * cookies in sync. Route protection is NOT done here — protected layouts call
 * `getUser()` themselves and redirect (added in P1-03/04). This keeps the
 * matcher simple and avoids redirect loops before the login page exists.
 *
 * Do not insert logic between createServerClient and getUser().
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT: revalidates the auth token. Removing this can randomly log
  // users out under SSR.
  await supabase.auth.getUser();

  return supabaseResponse;
}
