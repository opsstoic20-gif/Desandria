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
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
