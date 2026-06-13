import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection lives here (not in middleware) so the matcher stays simple.
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <span className="font-semibold">Desandria</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-zinc-700 px-3 py-1 hover:border-zinc-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
