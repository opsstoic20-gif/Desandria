# Smoke-test runbook

Every prompt ends with its smoke test run and shown (CLAUDE.md rule 2). This file records the command(s), expected output, and the latest status. Update the status line whenever a smoke is re-run.

## P0-01 — Scaffold

```powershell
pnpm install
pnpm lint          # expect: clean exit
pnpm typecheck     # expect: clean exit
pnpm build         # expect: "Compiled successfully", routes /, /health listed
pnpm start -p 3111 # then:
Invoke-RestMethod http://localhost:3111/health   # expect: {"ok":true}
```

**Status: PASS (2026-06-12).** Build green; `GET /health` → `{"ok":true}`.

## P0-02 — Drizzle schema + first migration

```powershell
pnpm db:generate   # expect: 3 tables — users, plans, audit_log; SQL file in drizzle/
pnpm lint && pnpm typecheck
```

Verify the generated SQL contains `ENABLE ROW LEVEL SECURITY` for `users` and `audit_log`, the `audit_log_actor_user_id_users_id_fk` FK, and both audit indexes.

**Status: PASS (2026-06-12).** `drizzle/0000_last_warstar.sql` generated and verified.

## P0-03 — DB round-trip through the Tunnel

Prereq: `.env` with `DATABASE_URL` pointing at the Mumbai Postgres via Cloudflare Tunnel.

```powershell
pnpm db:migrate            # applies drizzle/ migrations to the Mumbai Postgres
pnpm dev                   # then open:
# http://localhost:3000/db-check  → must render "Postgres time" + "Rows in plans" (no error banner)
```

**Status: BLOCKED (2026-06-12).** Code in place (`src/db/index.ts`, `src/app/db-check/page.tsx`); cannot run without `DATABASE_URL` / Tunnel credentials. Build verified green without env (lazy client).

## P0-04 — Vercel preview deploy (phase gate)

Prereq: Vercel project linked, env vars set in Vercel (at minimum `DATABASE_URL`).

```powershell
vercel deploy              # or deploy via the Vercel MCP / git integration
# then: https://<preview-url>/health    → {"ok":true}
# and:  https://<preview-url>/db-check  → renders live data from the Mumbai Postgres
```

**P0 gate:** prod URL renders data read from the Mumbai Postgres (desandria.md §8).

**Status: BLOCKED (2026-06-12).** Needs Vercel project link + Tunnel hostname reachable from Vercel's network (public Tunnel hostname for Postgres, protected by strong auth — see docs/MCP-AND-INTEGRATIONS.md §Tunnel).

## Conventions for future phases

- Each P*-NN prompt adds its smoke section here before the prompt is reported DONE.
- A smoke that can't run in the current environment is recorded **BLOCKED** with the exact missing prerequisite — never marked PASS on the strength of "the code looks right."
- Gate-level smokes (the §8 italics lines) get their own subsection and must be re-run, not assumed, when the gate is requested.
