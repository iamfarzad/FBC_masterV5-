import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/core/database.types';
import type { SupabaseClientCompat } from '@/src/types/supabase-compat';

function requireEnv(name: string){ const v=process.env[name]; if(!v) throw new Error(`Missing env: ${name}`); return v; }

export function getSupabaseServer(): SupabaseClientCompat<Database> {
  const url=requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon=requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient<Database, any, any, any, any, any>(url, anon);
}

export function getSupabaseService(): SupabaseClientCompat<Database> {
  const url=requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const svc=requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database, any, any, any, any, any>(url, svc);
}