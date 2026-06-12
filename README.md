# Desandria

Describe your Discord bot in plain English → it's generated, tested, and hosted 24/7 in minutes.

- **Spec / source of truth:** [desandria.md](./desandria.md) — read it first; it wins over everything.
- **Build rules for Claude Code:** [CLAUDE.md](./CLAUDE.md)
- **Progress:** [docs/STATUS.md](./docs/STATUS.md) · **Smokes:** [docs/SMOKE-TESTS.md](./docs/SMOKE-TESTS.md) · **Integrations:** [docs/MCP-AND-INTEGRATIONS.md](./docs/MCP-AND-INTEGRATIONS.md)

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind 4 · Drizzle ORM · self-hosted Supabase (Postgres + Auth, Mumbai VPS via Cloudflare Tunnel) · Vercel (web) · Cloudflare R2 (artifacts/backups) · pg-boss (queue) · discord.js (bot runtime)

## Setup

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL at minimum
pnpm dev
```

| Script | Does |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm lint` / `typecheck` / `format` | Quality gates (CI runs lint + typecheck + build) |
| `pnpm db:generate` | Generate Drizzle migration from `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |

Health check: `GET /health` → `{"ok":true}`. DB round-trip proof: `/db-check`.
