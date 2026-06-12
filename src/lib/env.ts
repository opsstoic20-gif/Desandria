import "server-only";

import { z } from "zod";

/**
 * Server-only env access (desandria.md §12: secrets only via env; zod on
 * every input). Parse is lazy + cached so `next build` succeeds without a
 * populated .env — anything touching the DB at runtime fails loudly instead.
 *
 * NEVER import this file from a client component.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required (Mumbai Postgres via Cloudflare Tunnel)")
    .refine((v) => v.startsWith("postgres://") || v.startsWith("postgresql://"), {
      message: "DATABASE_URL must be a postgres:// connection string",
    }),
  MAX_HOSTED_BOTS: z.coerce.number().int().positive().default(50),
  LLM_MONTHLY_CAP_USD: z.coerce.number().positive().default(50),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    // Safe to throw the variable NAMES — never values.
    throw new Error(`Invalid server environment: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
