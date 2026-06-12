import { sql } from "drizzle-orm";

import { getDb } from "@/db";
import { plans } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * P0-03 / P0 gate proof page: renders a value read live from the Mumbai
 * Postgres through the Cloudflare Tunnel. No secrets are ever rendered.
 */
export default async function DbCheckPage() {
  let serverTime: string | null = null;
  let planCount: number | null = null;
  let error: string | null = null;

  try {
    const db = getDb();
    const timeRows = await db.execute<{ now: string }>(
      sql`select now()::text as now`,
    );
    serverTime = timeRows[0]?.now ?? null;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(plans);
    planCount = countRows[0]?.count ?? 0;
  } catch {
    // Never echo driver errors to the page — they can contain the host/user
    // from the connection string. Details belong in server logs only.
    error =
      "Database unreachable. Check DATABASE_URL and the Cloudflare Tunnel.";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Database round-trip check</h1>
      {error ? (
        <p className="rounded bg-red-950 px-4 py-2 text-red-300">{error}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-zinc-400">Postgres time</dt>
          <dd className="font-mono">{serverTime}</dd>
          <dt className="text-zinc-400">Rows in plans</dt>
          <dd className="font-mono">{planCount}</dd>
        </dl>
      )}
    </main>
  );
}
