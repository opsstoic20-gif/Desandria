import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Documented exception to the "src/lib/env.ts is the only env reader"
    // rule (CLAUDE.md drift trap #6): env.ts is `server-only` and cannot be
    // imported by the drizzle-kit CLI. Empty fallback keeps `db:generate`
    // working offline; `db:migrate`/`db:studio` fail loudly without a URL.
    //
    // Migrations/DDL prefer MIGRATE_DATABASE_URL (Supabase session pooler,
    // port 5432) — the transaction pooler (6543) the app uses is unreliable
    // for drizzle-kit migrate. Falls back to DATABASE_URL when unset.
    url: process.env.MIGRATE_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
