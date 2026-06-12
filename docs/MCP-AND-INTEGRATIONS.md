# MCPs & integrations checklist

What needs to be plugged in, when, and what it's for. Two categories: **MCP servers** (tools for Claude Code while building) and **external services** (the product's own plumbing).

## MCP servers for Claude Code

| MCP | Status | Used for | Phase |
|---|---|---|---|
| **Vercel** | connected | Deploys, build logs, env vars, preview URLs | P0-04 onward |
| **context7** | connected | Current docs for Next.js 15, Drizzle, discord.js, Razorpay SDKs | all |
| **chrome-devtools** | connected (plugin) | Driving/screenshotting the wizard + dashboard for UX smokes | P2, P7 |
| **Supabase (claude.ai)** | connected, **limited use** | ⚠ Targets supabase.com **cloud** projects. Our Supabase is **self-hosted** on the Mumbai VPS — not manageable through this MCP. Use it only for `search_docs`. DB work goes through `DATABASE_URL` + drizzle-kit/psql. | docs only |
| **Discord plugin** (`discord:access` / `discord:configure` skills) | available | Test-guild operations for the P3/P4 harness (command registration checks, scripted invocations) | P3–P4 |
| **PostHog** | connected | Claude Code tooling only (querying its docs/tools). The **product** does not send events to PostHog — internal cost/burn/funnel views live in the admin panel on our own tables (§3.8, §4.3, §5.6). Adding PostHog to the product would require a desandria.md edit. | — |
| Figma / Notion / Drive / Spotify / Stripe MCPs | connected | Not needed for v1. Stripe MCP irrelevant — payments are Razorpay + NOWPayments (§1). | — |

**Missing / nice-to-have MCPs:** none required for P0–P2. For P5–P7 Pradyuman works on the VPS directly (SSH/Coolify), no MCP needed.

## External services — credential checklist

| Service | Env vars | Needed by | Owner action |
|---|---|---|---|
| Mumbai Postgres via Cloudflare Tunnel | `DATABASE_URL` | **P0-03 (now)** | Create a Tunnel public hostname (TCP) for Postgres; strong password + (ideally) Cloudflare Access service token. Vercel must be able to reach it. |
| Self-hosted Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` | P1 auth | Copy keys from the VPS Supabase stack; set Site URL + redirect URLs for Vercel domains. |
| Discord OAuth app (Desandria's own — for *sign-in only*, never for customer bots) | client id/secret (added to Supabase Auth provider config) | P1 | Create app in Discord Developer Portal; add redirect: `<SUPABASE_URL>/auth/v1/callback`. |
| Token vault key | `TOKEN_ENC_KEY` | P2 | `openssl rand -hex 32`. Store in Vercel env + VPS env. Rotation invalidates stored tokens — document before rotating. |
| Private test guild | guild id (env later) | P3–P4 harness | Founder TODO §11.4. |
| DeepSeek | `DEEPSEEK_API_KEY` | P4 | Create account, set spend limit ≤ $50/mo at the provider too. |
| Anthropic | `ANTHROPIC_API_KEY` | P4 (escalation only) | Same — provider-side budget. |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_ARTIFACTS`, `R2_BUCKET_BACKUPS` | P4 artifacts, P7 backups | Create both buckets + scoped API token. |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | P6 | KYC + international activation (founder TODO §11.3) — start now, it's slow. |
| NOWPayments | `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` | P6 | Account + IPN callback URL. |
| Vercel | project link | P0-04 | Link repo (git push → deploy) or deploy via Vercel MCP; set all env vars in Vercel dashboard, **server-side only** (no `NEXT_PUBLIC_` for secrets). |
| VPS (Docker, Coolify, n8n) | SSH access | P5–P7 | Pradyuman. n8n reused for alert flows (CLAUDE.md table). |
| Guardrails | `MAX_HOSTED_BOTS=50`, `LLM_MONTHLY_CAP_USD=50` | P4/P5 | Set everywhere the app or orchestrator runs. |

## Secrets policy (restated)

Secrets live in: local `.env` (gitignored), Vercel env, VPS env files. Never in code, logs, error pages, commits, or chat transcripts. `src/lib/env.ts` is the single env reader — extend its zod schema when a new var is consumed.
