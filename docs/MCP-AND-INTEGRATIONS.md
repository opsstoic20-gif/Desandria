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
| **Supabase Cloud (dev DB)** | `DATABASE_URL` (`:6543` txn pooler), `MIGRATE_DATABASE_URL` (`:5432` session pooler) | **DONE (dev)** | ✅ Wired + migrated. Project `efterrtpcbyjriljnfzt`, region Seoul. **Temporary** — prod moves to self-hosted Mumbai (STATUS.md deviation). Rotate the pasted password. |
| Mumbai Postgres via Cloudflare Tunnel (prod) | `DATABASE_URL` | pre-launch | Create a Tunnel TCP hostname for Postgres; strong auth; reachable from Vercel. Swap the dev URLs for these. |
| Self-hosted Supabase (prod) / Cloud (P1 dev) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` | P1 auth | For P1 dev, copy the anon/service keys + URL from the **Supabase Cloud** dashboard (same project). Set Site URL + redirect URLs for localhost + Vercel domains. |
| Discord OAuth app (Desandria's own — for *sign-in only*, never for customer bots) | client id/secret (added to Supabase Auth provider config) | P1 | Create app in Discord Developer Portal; add redirect: `<SUPABASE_URL>/auth/v1/callback`. |
| Token vault key | `TOKEN_ENC_KEY` | P2 | ✅ Provided (32-byte hex) — in `.env`. Add to Vercel env at P0-04. Rotate the pasted value; rotation invalidates stored tokens. |
| Private test guild | guild id (env later) | P3–P4 harness | Founder TODO §11.4. |
| DeepSeek | `DEEPSEEK_API_KEY` | P4 | Pending — founder buying credits. Default generator (§1). Set spend limit ≤ $50/mo provider-side too. |
| Anthropic / **aerolink** (test) | `AEROLINK_API_KEY` (+ base URL TBD) | P4 (escalation/testing) | ✅ aerolink key provided ($100 test credit, Claude+codex). Confirm the gateway base URL at P4 — it is **not** `api.anthropic.com`; the OpenAI/Anthropic SDK `baseURL` must point at aerolink. Rotate the pasted key. |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_ARTIFACTS`, `R2_BUCKET_BACKUPS` | P4 artifacts, P7 backups | Create both buckets + scoped API token. |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | P6 | ✅ KYC done, account set up (founder). Keys to be added to `.env`/Vercel at P6. |
| NOWPayments | `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` | P6 | ✅ Account set up (founder). Keys + IPN callback URL added at P6. |
| GitHub MCP | PAT (in MCP config) | now | ⚠ PAT pasted in chat — **rotate it**. Repo `opsstoic20-gif/Desandria` already wired as `origin`; pushes work via Git Credential Manager. |
| Vercel | project link | P0-04 | Link repo (git push → deploy) or deploy via Vercel MCP; set all env vars in Vercel dashboard, **server-side only** (no `NEXT_PUBLIC_` for secrets). |
| VPS (Docker, Coolify, n8n) | SSH access | P5–P7 | Pradyuman. n8n reused for alert flows (CLAUDE.md table). |
| Guardrails | `MAX_HOSTED_BOTS=50`, `LLM_MONTHLY_CAP_USD=50` | P4/P5 | Set everywhere the app or orchestrator runs. |

## Secrets policy (restated)

Secrets live in: local `.env` (gitignored), Vercel env, VPS env files. Never in code, logs, error pages, commits, or chat transcripts. `src/lib/env.ts` is the single env reader — extend its zod schema when a new var is consumed.
