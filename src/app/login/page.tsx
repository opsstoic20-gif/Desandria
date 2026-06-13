import { redirect } from "next/navigation";

import { signIn, signInWithDiscord, signUp } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; mode?: string }>;
}) {
  // Already signed in → go to the dashboard.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const { error, notice } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Sign in to Desandria</h1>
          <p className="text-sm text-zinc-500">
            Describe a Discord bot. We build and host it.
          </p>
        </div>

        {error ? (
          <p className="rounded bg-red-950 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        ) : null}

        <form className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Password (8+ characters)"
            autoComplete="current-password"
            className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              formAction={signIn}
              className="flex-1 rounded bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
            >
              Sign in
            </button>
            <button
              type="submit"
              formAction={signUp}
              className="flex-1 rounded border border-zinc-700 px-3 py-2 text-sm font-medium hover:border-zinc-500"
            >
              Create account
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="h-px flex-1 bg-zinc-800" />
          or
          <span className="h-px flex-1 bg-zinc-800" />
        </div>

        <form action={signInWithDiscord}>
          <button
            type="submit"
            className="w-full rounded bg-[#5865F2] px-3 py-2 text-sm font-medium text-white hover:bg-[#4752c4]"
          >
            Continue with Discord
          </button>
        </form>
      </div>
    </main>
  );
}
