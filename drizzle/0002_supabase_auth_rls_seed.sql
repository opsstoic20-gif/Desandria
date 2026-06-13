-- Custom migration: link public.users to Supabase auth.users, auto-provision
-- trigger, RLS policies, and seed billing plans (desandria.md §4.1, §5.6).

-- 1) public.users.id references auth.users(id); delete cascades from auth.
ALTER TABLE "users"
  ADD CONSTRAINT "users_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- 2) Auto-create a public.users row when an auth user is created.
-- SECURITY DEFINER + empty search_path is the Supabase-recommended secure form;
-- all objects are fully qualified because search_path is empty.
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
--> statement-breakpoint

CREATE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
--> statement-breakpoint

-- 3) RLS policies on public.users (RLS already enabled in 0000). A user may
-- read/update only their own row. Inserts/deletes happen via the SECURITY
-- DEFINER trigger / auth cascade, so no public insert/delete policy.
-- (select auth.uid()) is the performance-optimized form.
CREATE POLICY "users_select_own" ON "public"."users"
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = "id");
--> statement-breakpoint

CREATE POLICY "users_update_own" ON "public"."users"
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = "id")
  WITH CHECK ((SELECT auth.uid()) = "id");
--> statement-breakpoint

-- 4) Seed plans (desandria.md §4.1). Prices in minor units (USD cents / INR
-- paise). Idempotent. NOTE: per-plan generation/edit counts for paid tiers are
-- placeholders pending founder confirmation (spec pins only Spark=3 gens/mo,
-- Forge=20 edits/mo) — tracked in docs/STATUS.md open questions.
INSERT INTO "plans" (
  "id", "name", "monthly_price_usd_cents", "monthly_price_inr_paise",
  "yearly_price_usd_cents", "monthly_generation_limit", "monthly_chat_edit_limit",
  "hosting_247", "source_export", "branding_removable", "features"
) VALUES
  ('spark', 'Spark', 0, 0, NULL, 3, 0, false, false, false,
    '{"sandbox_only": true, "sleeps_after_minutes": 30, "branding": "Powered by Desandria"}'),
  ('forge', 'Forge', 400, 34900, 3900, 20, 20, true, false, true,
    '{"uptime_monitor": true, "logs": true}'),
  ('pro', 'Pro', 900, 79900, NULL, 50, 50, true, true, true,
    '{"priority_queue": true, "claude_tier_regens": true, "webhook_api": true}'),
  ('byo_host', 'BYO Host', 300, 0, NULL, 0, 0, true, false, true,
    '{"byo_code": true, "scan_reviewed": true}'),
  ('dfy', 'Done-For-You', 0, 0, NULL, 0, 0, true, true, false,
    '{"one_time_from_usd_cents": 9900, "desandria_fee_pct": 25, "manual_referral": true, "discord_premium_apps_setup": true}')
ON CONFLICT ("id") DO NOTHING;
