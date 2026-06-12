import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// P0-02 tables: users, plans, audit_log (desandria.md §5.6).
// Remaining tables (bots, bot_versions, modules, generations, test_runs,
// deployments, subscriptions, payments, entitlements, abuse_flags,
// discord_accounts) land in their owning phases (P1–P6) as separate migrations.
// ─────────────────────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", ["user", "admin"]);

/**
 * Application users. In P1 this links to Supabase Auth (id = auth.users.id).
 * RLS is enabled here (deny-by-default); auth-aware policies are added in P1
 * when Supabase Auth is wired up (desandria.md §8 P1 gate).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

/**
 * Billing plans (desandria.md §4.1). Public reference data — no RLS.
 * Prices stored in minor units (cents/paise) to avoid float money math.
 * Seeded in P1 (plans table seeded is a P1 deliverable).
 */
export const plans = pgTable("plans", {
  /** slug: spark | forge | pro | byo_host | dfy */
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  monthlyPriceUsdCents: integer("monthly_price_usd_cents").notNull().default(0),
  monthlyPriceInrPaise: integer("monthly_price_inr_paise").notNull().default(0),
  yearlyPriceUsdCents: integer("yearly_price_usd_cents"),
  monthlyGenerationLimit: integer("monthly_generation_limit")
    .notNull()
    .default(0),
  monthlyChatEditLimit: integer("monthly_chat_edit_limit").notNull().default(0),
  hosting247: boolean("hosting_247").notNull().default(false),
  sourceExport: boolean("source_export").notNull().default(false),
  brandingRemovable: boolean("branding_removable").notNull().default(false),
  features: jsonb("features")
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Append-only audit trail. Every mutating endpoint writes here
 * (desandria.md §12). Admin/service-role access only — RLS enabled with no
 * policies = deny all non-service access.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    meta: jsonb("meta")
      .notNull()
      .default(sql`'{}'::jsonb`),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_actor_idx").on(t.actorUserId),
    index("audit_log_created_idx").on(t.createdAt),
  ],
).enableRLS();
