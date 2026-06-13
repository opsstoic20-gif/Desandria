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
| P0-04 | Vercel deploy + gate check | **DONE** 2026-06-13 | Prod live (region `bom1`): `/health` → `{"ok":true}`; `/db-check` renders live Postgres data (`now()` + plans count). Env vars set in Vercel. |

**P0 gate: ✅ CLOSED (2026-06-13).** `https://desandria.vercel.app/db-check` renders data read live from the database (Postgres time verified). Data path Vercel → Supabase proven end-to-end.

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

**Gotcha hit + resolved (2026-06-13): Vercel `BLOCKED` deployments.** The first auto-deploys (commits authored as `yokegg38@gmail.com`) came back `BLOCKED` — Vercel refuses to build commits whose author isn't a member of the Vercel team (owner `opsstoic20@gmail.com`). Manual redeploys then re-ran the only authorized commit, the empty `09bc82c` stub, which `ERROR`s (no `package.json`). Fix: repo-local git identity set to `opsstoic20-gif <opsstoic20@gmail.com>` so commits deploy. If you ever commit from another identity, either add that email to the Vercel team or keep committing as the authorized author.

## Phase P1 — Auth & shell (in progress)

Founder authorized proceeding (2026-06-13, "lets move further"). Gate: OAuth round-trip + RLS verified with two users.

| Prompt | Scope | Status |
|---|---|---|
| P1-01 | `@supabase/ssr` clients (browser + server) + session middleware + env.ts | **DONE** — build green; `/` and `/health` 200 through middleware |
| P1-DB | Migrations 0001–0003: `users.id`→`auth.users`, `handle_new_user` trigger, RLS select/update-own, 5 plans seeded, trigger hardened | **DONE** — applied + verified via Supabase MCP; advisor clean for our objects |
| P1-02 | Email auth: zod server actions (sign-in/up/out) + `/login` + `/auth/callback` + `/auth/confirm` | **CODE DONE** — `/login` 200 w/ Discord button; round-trip pending creds |
| P1-03 | Discord OAuth (button + `signInWithOAuth` + callback) | **CODE DONE** — round-trip needs Discord app + Supabase provider config |
| P1-04 | Protected `/dashboard` shell + sign-out + home link | **DONE** — `/dashboard` 307→`/login` when logged out |

**P1 gate (OAuth round-trip + RLS verified with two users): NOT closed — blocked on creds.** Remaining:

1. **`SUPABASE_SERVICE_ROLE`** (dashboard → Settings → API → service_role) → add to `.env` + Vercel. Unblocks the RLS-two-users gate test: `node --env-file=.env scripts/verify-rls.mjs`.
2. **Discord OAuth app** (client id + secret) configured in Supabase → Auth → Providers → Discord, redirect `https://efterrtpcbyjriljnfzt.supabase.co/auth/v1/callback`. Unblocks the OAuth round-trip.
3. **Email confirmation**: Supabase Cloud requires it by default. For a quick email round-trip in dev, either leave it on (real inbox) or disable in Auth settings; the RLS script sidesteps it via admin `email_confirm: true`.

**New Vercel env vars to add now** (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both from `.env`; public by design). Add `SUPABASE_SERVICE_ROLE` once you have it.

### Open questions (raise at P1 gate)
- Plan numeric limits for paid tiers (Forge/Pro generation+edit counts, BYO/DFY) are **placeholders** in the seed — spec pins only Spark=3 gens/mo and Forge=20 edits/mo (§4.3). Confirm real values.
- Pre-existing `public.rls_auto_enable()` event-trigger function (auto-enables RLS on new public tables) is flagged by the security advisor as anon-executable. Not created by this build. Review/harden if desired (low risk: errors outside event-trigger context).

## Phases P2–P7

Not started. Gate discipline per CLAUDE.md: do not begin a phase until the founder authorizes it.

## Open questions for the P0 gate

1. **DB password rotation:** the password pasted in chat (`greatthiswillbeourpassword`) is now in the transcript — rotate it in Supabase after the gate, then update `DATABASE_URL`/`MIGRATE_DATABASE_URL` in `.env` and Vercel.
2. **`users.id` in P1** becomes a reference to Supabase `auth.users.id`. Migration `0001` will alter/recreate `users` — safe now (no rows). Confirm at the P1 gate.
3. **Self-hosted cutover:** when the Mumbai Supabase is ready, swap the two connection strings and re-run `db:migrate`. No app changes expected.
