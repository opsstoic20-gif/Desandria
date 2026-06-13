"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

async function originUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function backToLogin(message: string, mode?: string): never {
  const params = new URLSearchParams({ error: message });
  if (mode) params.set("mode", mode);
  redirect(`/login?${params.toString()}`);
}

export async function signIn(formData: FormData): Promise<void> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    backToLogin(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) backToLogin(error.message);

  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<void> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    backToLogin(parsed.error.issues[0]?.message ?? "Invalid input.", "signup");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await originUrl()}/auth/confirm` },
  });
  if (error) backToLogin(error.message, "signup");

  redirect("/login?notice=Check+your+email+to+confirm+your+account.");
}

export async function signInWithDiscord(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${await originUrl()}/auth/callback`,
      scopes: "identify email",
    },
  });
  if (error) backToLogin(error.message);
  if (data.url) redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
