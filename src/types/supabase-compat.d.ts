import type { SupabaseClient as _SupabaseClient } from '@supabase/supabase-js';

export type SupabaseClientCompat<DB = any> = _SupabaseClient<
  DB, any, any, any, any, any
>;

// Allow consumers to import by name from package if needed.
declare module '@supabase/supabase-js' {
  export type SupabaseClientCompat<DB = any> = _SupabaseClient<DB, any, any, any, any, any>;
}
