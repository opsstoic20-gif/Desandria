import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;

/**
 * Lazy singleton — env is validated on first use, not at import time, so
 * `next build` succeeds without a populated .env. Connection goes to the
 * self-hosted Supabase Postgres on the Mumbai VPS via Cloudflare Tunnel.
 */
export function getDb(): Db {
  if (_db) return _db;
  const client = postgres(serverEnv().DATABASE_URL, {
    // Supavisor/pgbouncer-safe: no server-side prepared statements.
    prepare: false,
    max: 5,
  });
  _db = drizzle(client, { schema });
  return _db;
}
