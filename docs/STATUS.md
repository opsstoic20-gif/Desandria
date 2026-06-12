# Build status

Single place a fresh Claude session (or Opus) reads to know where the build is. Update after every prompt.

## Phase P0 — Foundations

| Prompt | Scope | Status | Smoke |
|---|---|---|---|
| P0-01 | Next.js 15 + TS strict + Tailwind + Drizzle deps + ESLint/Prettier + `/health` + `.env.example` + CI | **DONE** 2026-06-12 | PASS — build green, `/health` → `{"ok":true}` |
| P0-02 | Drizzle config + schema + first migration (`users`, `plans`, `audit_log`) | **DONE** 2026-06-12 | PASS — migration generated + verified, lint/typecheck green |
| P0-03 | DB client + `/db-check` server-component round-trip read | **CODE DONE / SMOKE BLOCKED** | Needs `DATABASE_URL` (Cloudflare Tunnel hostname + creds) |
| P0-04 | Vercel preview deploy + gate check | **BLOCKED** | Needs Vercel project link + env vars |

**P0 gate:** prod URL renders data read from the Mumbai Postgres. **NOT PASSED yet.**

## Phases P1–P7

Not started. Gate discipline per CLAUDE.md: do not begin P1 until founder types `GATE PASSED` for P0.

## Open questions for the P0 gate

1. Cloudflare Tunnel: is there already a TCP public hostname for Postgres reachable from outside the VPS (Vercel functions must connect)? If not, who creates it — founder or Pradyuman?
2. Self-hosted Supabase: confirm Postgres superuser vs. app-role credentials to use in `DATABASE_URL` (app role preferred; migrations may need elevated role).
3. Vercel: deploy under which account/team? Link by git remote (none exists yet — repo is local-only) or CLI/MCP deploy?
4. `users.id` in P1 will become a reference to Supabase `auth.users.id` — confirm acceptable to recreate/alter the table in migration 0001 (no data exists yet, safe).
