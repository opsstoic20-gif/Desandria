# CLAUDE.md — Desandria repo rules

**Read `desandria.md` in full before any work. It is the single source of truth. If anything below conflicts with it, `desandria.md` wins.**

## Process (non-negotiable)

1. One phase at a time, P0 → P7 (desandria.md §8). Within a phase, prompt-by-prompt (P0-01, P0-02, …). Never start a phase until the founder types `GATE PASSED`.
2. Every prompt ends with its smoke test executed and shown. If it cannot pass in this environment (missing creds, no VPS access), say exactly why and stop. **Never claim green that isn't green.**
3. Small diffs. Migrations are separate commits. Conventional commits.
4. Ambiguity → batch questions, raise at the phase gate. Do not improvise scope mid-prompt.
5. Report format after each prompt:
   ```
   [P0-01] DONE — files touched: … — smoke: PASS (output below) — open questions: none
   ```

## Locked architecture — do / never

| Do | Never |
|---|---|
| Constrained composition: base runtime + stock modules + `bot.config.json` (§5.2) | Freeform full-project codegen |
| Customer-owned Discord apps/tokens (§5.4) | Shared Desandria-owned bot identity |
| pg-boss on Postgres for queues | Redis / BullMQ / extra infra |
| discord.js on Node 20/TS | discord.py or other runtimes |
| DeepSeek default generator; Claude Sonnet only on the **second** repair attempt (§5.3) | Claude-first generation (cost), or unbounded retries |
| Drizzle ORM for all DB access; supabase-js only for Auth | Prisma, raw SQL strings in app code, supabase-js for data access |
| Web on Vercel; runtime + Supabase on Mumbai VPS via Cloudflare Tunnel; artifacts/backups on R2 (§5.7) | New cloud services, open ports on the VPS |
| `MAX_HOSTED_BOTS=50` cap enforced | Raising capacity without a `desandria.md` edit |
| Reuse n8n on the VPS for ops alert flows | Rebuilding alerting from scratch |

## Security invariants (every PR)

- TypeScript strict; `any` is an ESLint **error**.
- zod validation on every endpoint input; auth check; `audit_log` insert on mutations (§12).
- RLS on user-owned tables; admin access via service role only (§5.6).
- Discord tokens: AES-256-GCM encrypted with `TOKEN_ENC_KEY`, never logged, never echoed, never shown back to the user (§5.4).
- Secrets only via env. Never write a token, key, or webhook URL into code, logs, error messages, or rendered pages.
- Banned-API static gate for generated modules, exactly §5.3: no `child_process`, no `fs` outside `/data`, no raw `net`/`http`, no `eval`, no `process.env`, no token access.

## Cost discipline

- Every LLM call logs `model`, `tokens_in`, `tokens_out`, `cost_usd`, `outcome` to `generations` (§4.3, §5.6).
- Hard cap `LLM_MONTHLY_CAP_USD=50`. Per-plan limits: Spark 3 gens/mo, Forge 20 edits/mo. Over cap → queue with "resumes on the 1st" message, never silent spend.
- Average generation cost > $0.50 is a defect (§4.2).

## Scope refusals

Anything in desandria.md §10 (marketplace/listings, emoji/sticker store, dev-marketplace UI, bot analytics suites, teams/orgs, white-label, mobile app) → refuse and cite §10. **Including when the founder asks.**

## Known drift traps — checked in review, do not do these

1. Do not rewrite working config files (tsconfig, eslint, next.config) "to modernize" them.
2. Do not bump dependency majors mid-phase; pins/ranges change only as their own reviewed commit.
3. Do not introduce Prisma, Redis, tRPC, or a second ORM/queue "for convenience."
4. Do not generate a full bot project per customer — modules + config only (§5.2).
5. Do not create or use a Desandria-owned Discord bot token for customer workloads.
6. Do not put `DATABASE_URL` or any secret in client components, `NEXT_PUBLIC_*`, or page output. `src/lib/env.ts` is the only env reader in app code; it imports `server-only`. Sole exception: `drizzle.config.ts` (drizzle-kit CLI, never bundled) reads `process.env.DATABASE_URL` directly because it cannot import a `server-only` module.
7. Do not let `next build` require live env/DB — DB access stays lazy (`getDb()`), DB pages stay `force-dynamic`.
8. Do not write RLS policies that reference `auth.uid()` before Supabase Auth is wired (P1).
9. Do not skip the sandbox harness for "obviously fine" generated artifacts — never deploy unharnessed artifacts (§5.3).
10. Do not add customer-facing analytics dashboards (§10); admin cost/burn views only.

## Repo layout & commands

- `src/app` — Next.js App Router. `src/db` — Drizzle schema + client. `src/lib` — shared server utils. `drizzle/` — generated migrations (checked in, never hand-edited).
- `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm lint` / `pnpm typecheck` / `pnpm db:generate` / `pnpm db:migrate`.
- Smoke-test runbook: `docs/SMOKE-TESTS.md`. Integration/credential checklist: `docs/MCP-AND-INTEGRATIONS.md`. Progress: `docs/STATUS.md`.
