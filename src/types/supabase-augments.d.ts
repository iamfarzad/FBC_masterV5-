// Augment Supabase client with a .raw helper if present at runtime
import '@supabase/supabase-js'
declare module '@supabase/supabase-js' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface SupabaseClient<any, any, any, any, any> {
    raw?: (...args: any[]) => any
  }
}
