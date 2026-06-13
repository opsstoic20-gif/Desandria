# Build status

Single place a fresh Claude session (or Opus) reads to know where the build is. Update after every prompt.

## ⚠ Active deviations from desandria.md (founder-approved)

1. **Dev database = Supabase CLOUD, not self-hosted Mumbai.** Spec §1 locks self-hosted Supabase on the Mumbai VPS. For development we use a Supabase Cloud project (`efterrtpcbyjriljnfzt`, region `ap-northeast-2` / Seoul) via the connection poolers. Founder directive 2026-06-13: "we'll add the self-hosted one later, for now develop with this one." **Production must move to self-hosted before launch (§9).** No code is cloud-specific — only the connection strings change.
   - App runtime → **transaction pooler** `:6543` (`DATABASE_URL`), client uses `prepare: false`.
   - Migrations/DDL → **session pooler** `:5432` (`MIGRATE_DATABASE_URL`).

## Phase P0 — Foundations

| Prompt | Scope | Status | Smoke |
|---|---|---|---|
| P0-01 | Next.js 15 + TS strict + Tailwind + Drizzle deps + ESLint/Prettier + `/health` + `.env.example` + CI | **DONE** | PASS — build green, `/health` → `{"ok":true}`. Pushed to GitHub `opsstoic20-gif/Desandria`; first CI run triggers on push. |
| P0-02 | Drizzle config + schema + first migration (`users`, `plans`, `audit_log`) | **DONE** | PASS — migration generated + verified; **applied to Supabase** (`pnpm db:migrate` ✓). |
| P0-03 | DB client + `/db-check` server-component round-trip read | **DONE** 2026-06-13 | **PASS (real)** — `pnpm dev` → `/health` `{"ok":true}`, `/db-check` round-trip OK, `plans` rows = 0 (no seed yet, expected). |
| P0-04 | Vercel deploy + gate check | **BLOCKED on founder** | Needs repo connected to a Vercel project + env vars set (steps below). Deploy can't be done headlessly (CLI not authed; MCP only instructs). |

**P0 gate:** prod URL renders data read from the database. **Local round-trip PASSES; prod URL pending the Vercel connect below.**

### P0-04 — exact steps to finish the gate (founder, ~5 min)

1. Vercel dashboard → **Add New… → Project → Import** `opsstoic20-gif/Desandria` (enables Git integration → every push auto-deploys; framework auto-detected as Next.js, pnpm picked up from the `packageManager` pin).
2. **Environment Variables** (Production + Preview):
   - `DATABASE_URL` = the **transaction pooler** string (`…pooler.supabase.com:6543/postgres`).
   - `TOKEN_ENC_KEY` = (from `.env`).
   - `MAX_HOSTED_BOTS` = `50`, `LLM_MONTHLY_CAP_USD` = `50`.
   - **Do NOT** add `MIGRATE_DATABASE_URL` (migrations run from dev/CI, never from the serverless app).
3. Deploy → open `<url>/health` → `{"ok":true}` and `<url>/db-check` → renders Postgres time + plans rows. That closes the gate.
   - Alternative (CLI): run `vercel login` once locally, then ping me — I'll `vercel deploy` + `vercel env add` the rest.
   - Optional perf: set the Vercel project's function region to `icn1` (Seoul) to sit near the Supabase DB; iad1 (default, US East) works but adds cross-region latency.

## Phases P1–P7

Not started. Gate discipline per CLAUDE.md: do not begin P1 until founder types `GATE PASSED` for P0.

## Open questions for the P0 gate

1. **DB password rotation:** the password pasted in chat (`greatthiswillbeourpassword`) is now in the transcript — rotate it in Supabase after the gate, then update `DATABASE_URL`/`MIGRATE_DATABASE_URL` in `.env` and Vercel.
2. **`users.id` in P1** becomes a reference to Supabase `auth.users.id`. Migration `0001` will alter/recreate `users` — safe now (no rows). Confirm at the P1 gate.
3. **Self-hosted cutover:** when the Mumbai Supabase is ready, swap the two connection strings and re-run `db:migrate`. No app changes expected.
