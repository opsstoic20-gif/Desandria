# DESANDRIA — Product & Build Spec (v1)

> Canonical context file for Claude Code. Every decision in this file is LOCKED unless the founder edits this file directly. If a task conflicts with this file, this file wins. If something is genuinely ambiguous, stop at the phase gate and ask — do not improvise scope.

---

## 0. One-liner

**Desandria (desandria.com): describe your Discord bot in plain English → it's generated, tested, and hosted 24/7 in minutes.** "Lovable/Bolt, but for Discord bots." One subscription per bot. No code, no servers, no Developer-Portal confusion.

Strategy in one sentence: the product competes on **standardized end-to-end experience + distribution** (founder runs a marketing agency), not on "smarter AI than Kodari/Blink."

---

## 1. Locked decisions (founder Q&A, 2026-06-12)

- **v1 = Generation + Hosting only.** Bot marketplace, emoji/sticker marketplace, and a custom-dev *marketplace* are OUT of v1 (see §10). Custom dev exists only as a manual referral funnel (§4, DFY tier).
- **Primary customer:** non-technical owner/admin of a 50–5,000 member Discord server. Can run a community, cannot code or host. (Founder said "everyone"; that is not buildable. This is the lock.)
- **Source code is platform-held.** Base tiers do NOT export code. Pro tier unlocks source export. BYO-code hosting is a separate plan.
- **LLM:** DeepSeek (V3-class) is the default generator. Claude Sonnet is the escalation model on failure. Hard monthly API budget cap (§4.3).
- **Payments:** Razorpay (cards/UPI/subscriptions) + NOWPayments (crypto). 5% discount on crypto prepay.
- **Infra:** Founder's Mumbai VPS hosts the bot runtime + self-hosted Supabase, exposed via **Cloudflare Tunnel**. Web app on **Vercel**. Artifacts on **Cloudflare R2**. (Note: "R2 tunneling" was a conflation — R2 = object storage, Tunnel = networking. Both are used, correctly, as above.)
- **Capacity cap:** 50 hosted bots until the founder raises it in this file.
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind + Drizzle ORM + Supabase (self-hosted Postgres + Auth). Same family as Renvoire; Renvoire code is NOT imported, patterns may be copied.
- **Builders:** Founder prototypes P0–P4 in Claude Code; Pradyuman owns P5–P7, server setup, and ongoing runtime ops.
- **Monetization compliance:** Desandria charges for generation/hosting (B2B service to the developer — outside Discord's Monetization Requirements). If a customer wants to sell *premium features of their bot to its users*, Desandria does NOT process that money; the DFY referral devs wire it through **Discord Premium Apps checkout**. Desandria never becomes a payment rail for in-Discord paid features. Founder must read the current Discord Developer/Monetization Policy verbatim before launch (§11).

---

## 2. Customer & positioning

**Persona "Riya the server owner":** runs a 1,200-member community. Wants a welcome bot + leveling + a custom `/movienight` poll. Tried a YouTube tutorial, died at "hosting" and "privileged intents." Will pay a few dollars a month for it to just work. Will pay ₹8–40k one-time if someone builds something serious.

**Positioning sentence (use in all copy):** "Other tools generate code and leave you holding it. Desandria takes you from idea → live bot in your server, and keeps it alive."

**Pain ranking (founder-validated):** 1) hosting, 2) generation quality/asks-the-right-questions, 3) debugging, 4) discovery. The onboarding wizard (§5.4) and the spec-interview generation flow (§5.2) are the product expression of #1 and #2 — this IS the "standardization" differentiator.

---

## 3. v1 scope

**IN:**
1. Account: email + Discord OAuth sign-in.
2. Guided bot setup wizard (Discord app creation → token → intents → invite URL) — 5 minutes, screenshots, zero jargon.
3. Spec interview: structured form + chat that turns a plain-English ask into a build spec (asks clarifying questions — competitors don't).
4. Generation pipeline: spec → modules/config → static checks → sandbox smoke test → deployable artifact. Auto-repair loop.
5. Hosting runtime: one Docker container per bot on the Mumbai VPS, watchdog, logs in dashboard, status page.
6. Chat-edit: "describe a change" → module regen → redeploy.
7. Billing: plans in §4, Razorpay + NOWPayments, entitlement-driven suspension/grace.
8. Abuse controls (§6) and admin panel (founder ops: users, bots, kill switch, costs).

**OUT (v1):** public marketplace/listings, emoji/sticker store, dev marketplace UI, bot analytics suite, white-label, teams/orgs, mobile app, any Renvoire integration.

---

## 4. Pricing & unit economics

### 4.1 Plans (per bot unless noted)

| Plan | Price | What it includes |
|---|---|---|
| **Spark** (free) | $0 | 3 generations/mo, sandbox testing only (bot sleeps after 30 min), "Powered by Desandria" in `/help`, no 24/7 hosting, no export |
| **Forge** | **$4/mo** (₹349) or $39/yr | 24/7 hosting, 20 chat-edits/mo, logs, uptime monitor, branding removable |
| **Pro** | **$9/mo** (₹799) | Forge + **source code export**, priority queue, Claude-tier regens, webhook/API access |
| **BYO Host** | $3/mo | Customer's own code (scan-reviewed) hosted on the runtime |
| **Done-For-You** | from $99 one-time | Scoped manually; built by referral devs; **Desandria fee 25%**; includes Discord Premium Apps setup if the bot monetizes |

Crypto via NOWPayments = prepaid 6/12 months at 5% off (crypto subscriptions are clunky; prepay maps cleanly to entitlement months).

### 4.2 Unit economics (estimates — P4 gate measures real numbers)

- Generation COGS (DeepSeek, ~3–8 iterations): **~$0.10–0.30/bot**; Claude escalation worst case ~$1–2. Treat >$0.50 average as a defect.
- Hosting COGS at 50-bot density on a ₹700–1,000/mo box: **~₹14–20 (~$0.20–0.25)/bot/mo**.
- Payment fees: Razorpay ~2% domestic (intl higher + needs activation), NOWPayments ~0.5–1%. Verify current rates at P6.
- **Forge contribution margin ≈ $3.4–3.6 (~87%).** The business is margin-rich and volume-poor; distribution is the whole game.

### 4.3 Cost guardrails
- Hard cap: **$50/mo total LLM spend** (env-config). Per-user: free = 3 gens/mo, Forge = 20 edits/mo, burst-block above cap with a friendly "queue resumes on the 1st" message.
- Every LLM call logs tokens + cost to `generations` (§5.6). Admin panel shows daily burn.

### 4.4 Path to $10K/mo (context for product decisions, not a v1 metric)
≈ **2,000 paying bot-months** blended (e.g., 1,800 Forge + 180 Pro + ~6 DFY/mo + BYO). At 3–4% free→paid conversion this implies ~55–65K registered users — a 12–24 month distribution campaign, not a launch-week event. v1 metrics are in §9.

---

## 5. Architecture

### 5.1 System overview
```
[Vercel: Next.js app]──Cloudflare Tunnel──▶[Mumbai VPS]
        │                                    ├─ Supabase (Postgres + Auth, self-hosted)
        │                                    ├─ Orchestrator API (Node service)
        ▼                                    ├─ Docker: bot containers (≤50)
   [Cloudflare R2]◀── build artifacts ──────┤─ Sandbox runner (ephemeral containers)
   [DeepSeek / Anthropic APIs]               └─ Watchdog + log shipper
```
Queue: **pg-boss on Postgres** (no Redis; fewer moving parts). n8n (already running on the box) handles ops alerting flows.

### 5.2 Generation = constrained composition, NOT freeform codegen
This is the core technical decision. Bots are **base runtime + modules + config**, never a freeform generated project.

- **Base runtime** (one hardened image, discord.js on Node 20/TS): gateway connection, sharding-ready, command router, event bus, error capture (every handler wrapped, timeout 5s), per-bot SQLite at `/data` for persistence, health endpoint, module loader, structured logs.
- **Stock module library (v1, 10 modules):** moderation (warn/mute/kick/ban/strikes + word automod), welcome (message/DM + autorole), leveling (XP/ranks/leaderboard), polls, tickets (panel + private threads), reaction roles, VC/activity tracker, member-count channel, announcement scheduler, starboard. "Mega bot" = many modules enabled — it's just config.
- **LLM's job:** spec interview → output `bot.config.json` (select + parameterize stock modules). Only when stock can't cover the ask does it write a **custom module** against the strict contract:
```ts
export default defineModule({
  id: "movie-night",
  intents: ["Guilds", "GuildMessages"],     // whitelist-validated
  commands: [/* slash defs */],
  events: { messageCreate: handler },        // runtime-wrapped, sandboxed
  storage: { schema: { votes: "kv" } },      // namespaced per-bot SQLite
});
```
- **Why:** broken-code risk collapses (small surface, testable), hosting density rises, and a Discord API breaking change = rebuild ONE base image and roll, instead of patching 500 codebases.

### 5.3 Generation pipeline (P4)
spec → DeepSeek → config + custom modules → **static gate** (tsc, eslint, banned-API scan: no `child_process`, no `fs` outside `/data`, no raw `net/http`, no `eval`, no `process.env`, no token access) → **sandbox smoke** (ephemeral container joins Desandria's private test guild, registers commands, runs scripted invocations) → pass ⇒ artifact to R2 | fail ⇒ auto-repair (error fed back; retry ×2, second retry on Claude Sonnet) → still failing ⇒ human-review queue with user message "a specialist is checking your bot." Never deploy an artifact that hasn't passed the harness.

### 5.4 Identity & token model — ban blast radius
**Customers create their own Discord application and bot token** (the wizard walks them through it). Desandria NEVER runs customer bots under a shared Desandria-owned app. Tokens encrypted at rest (AES-256-GCM, key in env, never logged, never shown back). Consequence: if a customer's bot violates Discord ToS, Discord actions *their* app — the platform survives. This is non-negotiable architecture.

### 5.5 Payments & entitlements
Razorpay Subscriptions (monthly) + Razorpay one-time (yearly) + NOWPayments (prepaid months). Webhooks → `payments` → `entitlements`. Orchestrator reads entitlements: lapse → 5-day grace (bot runs, banner shown) → suspend (container stopped, data kept 30 days) → purge. All money events audited.

### 5.6 Data model (Drizzle/Postgres)
`users`, `discord_accounts`, `bots` (status: draft/testing/live/suspended), `bot_versions`, `modules` (stock + custom, per version), `generations` (prompt, model, tokens_in/out, cost_usd, outcome), `test_runs`, `deployments`, `plans`, `subscriptions`, `payments`, `entitlements`, `abuse_flags`, `audit_log`. RLS on user-owned tables; admin via service role only.

### 5.7 Deploy topology
- Web: Vercel (preview + prod). Secrets in Vercel env.
- VPS: Docker Compose stack (supabase, orchestrator, watchdog, n8n existing). All ingress via Cloudflare Tunnel; no open ports.
- R2: `artifacts/` (module bundles), `backups/` (§7).
- **One-box risk is acknowledged:** auth, DB, payments state, and all bots share one machine. Mitigation in §7; revisit topology at 150 bots (move money-path DB to managed Supabase or move runtime to Hetzner).

---

## 6. Abuse prevention & ToS compliance (J2 — solved by design)

1. **Spec-stage policy:** generation refuses raid/spam/mass-DM/scraper/self-bot/token-grabber/NSFW-in-SFW asks. Refusal logged to `abuse_flags`.
2. **Static bans** (§5.3) make most malware patterns unexpressible in modules.
3. **Egress firewall:** bot containers may reach Discord endpoints + a small allowlist only.
4. **Runtime rate caps** on REST calls per bot (under Discord's limits) — a misbehaving module throttles itself before Discord notices.
5. **Resource caps** per container (CPU/mem), restart backoff.
6. **Kill switch** in admin panel (instant stop + flag).
7. **AUP + report endpoint** public at launch; takedown SLA 24h.
8. Customer-owned tokens (§5.4) cap the blast radius of anything that slips through.

---

## 7. Reliability & ops (E3 — answered)

- **3am crash:** Docker `restart=always` + healthcheck (gateway ping). Watchdog posts to founder's Discord webhook; n8n escalates if down >10 min. Target: customer never files the ticket first.
- **Discord API breaking change:** discord.js pinned in the base image. Upgrade = build new image tag → canary on 5 internal bots for 48h → roll fleet. One rebuild, not N patches.
- **Backups:** nightly `pg_dump` + `/data` volumes → R2, 14-day retention, restore runbook tested at P7 gate.
- **Status page:** public, simple (runtime up, generation queue depth, incident notes).
- **Logs:** per-bot rotated files, last 500 lines streamable in dashboard.

---

## 8. Build phases & gates

One phase at a time. Each prompt ends with its smoke test passing before the next begins. Founder drives P0–P4; Pradyuman drives P5–P7.

**P0 Foundations (P0-01…04):** repo, Next.js 15 + TS + Tailwind + Drizzle, env scaffolding, connect self-hosted Supabase through Tunnel, CI (lint+typecheck), deploy hello to Vercel. *Gate: prod URL renders data read from the Mumbai Postgres.*

**P1 Auth & shell (P1-01…04):** Supabase Auth (email + Discord OAuth), session handling, dashboard shell, plans table seeded. *Gate: OAuth round-trip; RLS verified with two users.*

**P2 Wizard & token vault (P2-01…05):** guided Discord-app creation flow (copy + screenshots), token submit → encrypt → gateway verify → bot shows "online" badge, invite-URL builder with correct scopes/permissions, intents checklist. *Gate: a fresh non-technical tester gets a token connected in <10 min unassisted.*

**P3 Base runtime + stock modules (P3-01…08):** base image, module contract, loader, 10 stock modules, per-bot SQLite, test-guild harness. *Gate: a config-only "mega bot" passes scripted smoke in the test guild.*

**P4 Generation pipeline (P4-01…07):** spec interview UI, DeepSeek integration, config/custom-module output, static gate, sandbox runner, auto-repair ×2 with Claude escalation, cost logging, R2 artifacts. *Gate: 8/10 varied realistic requests pass unattended; average measured cost ≤ $0.50; numbers written into §4.2.*

**P5 Hosting & orchestration (P5-01…06):** orchestrator API (deploy/start/stop/restart/logs), per-bot containers, caps, watchdog + webhook alerts, 50-bot limit, status page. *Gate: `kill -9` a bot container → auto-recovery <60s → alert received → logs visible in dashboard.*

**P6 Billing (P6-01…06):** Razorpay subscriptions + yearly, NOWPayments prepaid, webhooks → entitlements, grace/suspend lifecycle, invoices, crypto 5% off. *Gate: test-mode purchase → bot live; cancel → grace banner → suspension; webhook replay is idempotent.*

**P7 Polish, abuse, launch (P7-01…06):** chat-edit flow, abuse scanning + kill switch + AUP/ToS/refund pages, admin panel, backup/restore drill, onboarding emails, launch checklist. *Gate: 3 design partners live and PAYING (test→live), restore drill passed.*

Timeline intent: P0–P4 ≈ weeks 1–4, P5–P7 ≈ weeks 5–8.

---

## 9. Success metrics (C3 — corrected)

- **Launch gate:** 3 paying design partners live.
- **Day 30:** 30 paying bots.
- **Day 60:** 100 hosted bots, ≥60% month-1 retention, ≈$400 MRR.
- North-star: **live-bot weeks** (a bot that stays deployed and paid). Payment gateway working is a checklist item, not a metric.

---

## 10. Non-goals (v1) — refuse and cite this section
Marketplace/listings of third-party bots; emoji/sticker store; dev-marketplace UI; bot analytics dashboards; multi-tenant teams; white-label; "all the bots in the world" indexing; any feature serving "everyone" instead of Riya (§2). Later flywheel (post-v1, do not build now): every generated bot can opt into a public Desandria gallery — generation seeds the marketplace.

---

## 11. Founder TODOs (non-code, parallel to P0–P2)
1. **10 customer interviews this week** (StoicOps reach): 5 questions — last bot you wanted, what blocked you, what did you try, what would you pay, would you prepay? Convert **3 into design partners** (commit to pay at launch). Do not start P4 without them.
2. Read the current **Discord Developer Policy + Monetization Policy** end-to-end; file notes in this repo.
3. Razorpay KYC + international activation; NOWPayments account.
4. Create the Desandria **private test guild** + a public support/showcase server.
5. Draft AUP, refund policy (one-time gens: 24h/no-deploy refund), ToS. Check GST treatment on Razorpay.
6. **Written agreement with Pradyuman:** scope, hours/week, comp (equity % or revenue share — $50/mo budget means he is not salaried), and the rule: while Desandria P5–P7 runs, Renvoire is feature-frozen. One dev cannot sprint two products.
7. Domain DNS → Vercel; Tunnel hostnames for api/status.
8. Correction noted: **Wispr Flow is a voice-dictation app, not bot hosting.** The Mumbai VPS is the host.

## 12. Conventions for Claude Code
- TypeScript strict; no `any`. Drizzle migrations checked in. Conventional commits.
- Secrets only via env; never write a token, key, or webhook URL into code or logs.
- Every endpoint: zod-validated input, auth check, audit log on mutations.
- Each prompt = small diff + its smoke test. If a smoke test cannot pass in the sandbox, say so and stop — do not fake green.
- When asked for anything in §10, refuse and point here.