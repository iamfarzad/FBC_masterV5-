import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// TODO: replace 'any' with generated Database type when available:
// type Database = import("@/types/database").Database;
type Database = any;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getSupabaseServer(): SupabaseClient<Database> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient<Database>(url, anon);
}

export function getSupabaseService(): SupabaseClient<Database> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const svc = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, svc);
}
