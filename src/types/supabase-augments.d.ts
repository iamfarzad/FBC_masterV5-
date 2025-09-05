// Augment Supabase client with a .raw helper if present at runtime
import '@supabase/supabase-js'
declare module '@supabase/supabase-js' {
  interface SupabaseClient<any, any, any, any, any> {
    raw?: (...args: any[]) => any
  }
}
