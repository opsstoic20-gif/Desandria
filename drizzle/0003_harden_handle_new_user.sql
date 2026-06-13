-- Harden the auth trigger function: it must only ever run as the
-- on_auth_user_created trigger, never as a PostgREST RPC. Triggers execute
-- their function regardless of EXECUTE grants, so revoking is safe and closes
-- the "SECURITY DEFINER function callable by anon/authenticated" advisor.
REVOKE EXECUTE ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."handle_new_user"() FROM anon;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."handle_new_user"() FROM authenticated;
