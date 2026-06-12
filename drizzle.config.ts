import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Required for `db:migrate` / `db:studio` only; `db:generate` works offline.
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
