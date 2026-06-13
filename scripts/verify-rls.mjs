// P1 gate check: RLS verified with two users (desandria.md §8 P1).
//
// Creates two confirmed users via the service-role admin API, signs each in
// with the anon key, and asserts that RLS lets each user read ONLY their own
// public.users row. Cleans up afterwards.
//
// Run: node --env-file=.env scripts/verify-rls.mjs
// Needs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !anonKey || !serviceRole) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const stamp = process.hrtime.bigint().toString();
const password = `Test-${stamp}-pw`;
const emails = [`rls-a-${stamp}@desandria.test`, `rls-b-${stamp}@desandria.test`];
const created = [];
let failures = 0;
const fail = (m) => {
  failures++;
  console.error(`  ✗ ${m}`);
};
const ok = (m) => console.log(`  ✓ ${m}`);

try {
  // 1) Create two confirmed users (trigger should create their public.users rows).
  for (const email of emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    created.push(data.user);
  }
  const [a, b] = created;
  ok(`created two users (${a.id.slice(0, 8)}…, ${b.id.slice(0, 8)}…)`);

  // 2) Trigger populated public.users for both (service role bypasses RLS).
  const { data: rows, error: rowsErr } = await admin
    .from("users")
    .select("id,email")
    .in("id", [a.id, b.id]);
  if (rowsErr) throw new Error(`admin read users: ${rowsErr.message}`);
  if (rows.length === 2) ok("handle_new_user trigger created both public.users rows");
  else fail(`expected 2 public.users rows, got ${rows.length}`);

  // 3) Sign in as user A with the anon key; RLS must scope reads to A only.
  const aClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signErr } = await aClient.auth.signInWithPassword({
    email: emails[0],
    password,
  });
  if (signErr) throw new Error(`signIn A: ${signErr.message}`);

  const { data: aVisible, error: aErr } = await aClient
    .from("users")
    .select("id,email");
  if (aErr) throw new Error(`A read users: ${aErr.message}`);

  if (aVisible.length === 1 && aVisible[0].id === a.id) {
    ok("user A sees exactly their own row");
  } else {
    fail(
      `RLS leak: user A saw ${aVisible.length} row(s): ${aVisible
        .map((r) => r.id.slice(0, 8))
        .join(", ")}`,
    );
  }
  if (aVisible.some((r) => r.id === b.id)) fail("RLS leak: user A can see user B");
} catch (e) {
  fail(e.message);
} finally {
  // Cleanup.
  for (const u of created) {
    await admin.auth.admin.deleteUser(u.id).catch(() => {});
  }
}

if (failures === 0) {
  console.log("\nRLS verification: PASS");
  process.exit(0);
} else {
  console.error(`\nRLS verification: FAIL (${failures} issue(s))`);
  process.exit(1);
}
