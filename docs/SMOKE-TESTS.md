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

## P0-03 — DB round-trip read

Prereq: `.env` with `DATABASE_URL` (app, transaction pooler `:6543`) and `MIGRATE_DATABASE_URL` (session pooler `:5432`). Dev DB is Supabase Cloud (see docs/STATUS.md deviation note).

```powershell
pnpm db:migrate            # applies drizzle/ migrations via the session pooler
$env:PORT=3112; pnpm dev   # then:
Invoke-WebRequest http://localhost:3112/health   -UseBasicParsing   # {"ok":true}
Invoke-WebRequest http://localhost:3112/db-check -UseBasicParsing   # contains "Postgres time", no "Database unreachable"
```

**Status: PASS (2026-06-13).** `db:migrate` → "migrations applied successfully". `/health` → `{"ok":true}`. `/db-check` → round-trip OK, `plans` rows = 0 (no seed yet — expected). Password verified correct against Supabase.

## P0-04 — Vercel deploy (phase gate)

Prereq: repo connected to a Vercel project (Git integration) + env vars set in Vercel — see docs/STATUS.md "P0-04 — exact steps".

```
# after the founder connects the repo + sets DATABASE_URL in Vercel:
https://<url>/health    → {"ok":true}
https://<url>/db-check  → renders Postgres time + plans rows (live read)
```

**P0 gate:** prod URL renders data read from the database (desandria.md §8).

**Status: PARTIAL (2026-06-13).** Prod deployed (Vercel project `desandria`, region `bom1`). `https://desandria.vercel.app/health` → `{"ok":true}` ✅. `/db-check` returns 200 but the DB-unreachable banner because env vars are not yet set in Vercel. Closing step: set `DATABASE_URL` (+ `TOKEN_ENC_KEY`, `MAX_HOSTED_BOTS`, `LLM_MONTHLY_CAP_USD`) in the Vercel project, then redeploy → `/db-check` renders live data = gate CLOSED.

Resolved gotcha: deployments of commits authored as `yokegg38@gmail.com` came back `BLOCKED` (author not on the Vercel team); commits now authored as `opsstoic20-gif <opsstoic20@gmail.com>` build normally.

## Conventions for future phases

- Each P*-NN prompt adds its smoke section here before the prompt is reported DONE.
- A smoke that can't run in the current environment is recorded **BLOCKED** with the exact missing prerequisite — never marked PASS on the strength of "the code looks right."
- Gate-level smokes (the §8 italics lines) get their own subsection and must be re-run, not assumed, when the gate is requested.
