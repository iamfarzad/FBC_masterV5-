import { createClient } from '@supabase/supabase-js'

export interface StorageConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export interface StorageResult<T = unknown> {
  data: T | null
  error: Error | null
}

export class SupabaseStorage {
  private client: unknown
  private serviceClient: unknown

  constructor(config: StorageConfig) {
    // Create regular client
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

    // Create service role client if available
    if (config.serviceRoleKey) {
      this.serviceClient = createClient(config.url, config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
  }

  static isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  static createFromEnv(): SupabaseStorage {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey) {
      throw new Error('Missing required Supabase environment variables')
    }

    return new SupabaseStorage({ url, anonKey, serviceRoleKey })
  }

  // Basic CRUD operations
  async select(table: string, options?: { 
    columns?: string
    filter?: Record<string, unknown>
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
  }): Promise<StorageResult> {
    try {
      let query = this.client.from(table).select(options?.columns || '*')
      
      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value)
        }
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
      }
      
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const result = await query
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async insert(table: string, data: unknown): Promise<StorageResult> {
    try {
      const result = await this.client.from(table).insert(data).select()
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async update(table: string, data: unknown, filter: Record<string, unknown>): Promise<StorageResult> {
    try {
      let query = this.client.from(table).update(data)
      
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value)
      }

      const result = await query.select()
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async delete(table: string, filter: Record<string, unknown>): Promise<StorageResult> {
    try {
      let query = this.client.from(table).delete()
      
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value)
      }

      const result = await query
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get the regular client for real-time features
  getClient() {
    return this.client
  }

  // Service role operations (admin only)
  getServiceClient() {
    if (!this.serviceClient) {
      throw new Error('Service role client not available - missing SUPABASE_SERVICE_ROLE_KEY')
    }
    return this.serviceClient
  }
}

// Create and export default instance
let defaultInstance: SupabaseStorage | null = null

export function getSupabaseStorage(): SupabaseStorage {
  if (!defaultInstance) {
    if (!SupabaseStorage.isConfigured()) {
      // During build time, provide a fallback that won't break the build
      const isBuildTime = typeof window === 'undefined' && !process.env.NODE_ENV
      if (isBuildTime) {
        // Return a mock instance for build time
        defaultInstance = createMockSupabaseStorage()
      } else {
        throw new Error('Supabase not configured - missing environment variables')
      }
    } else {
      defaultInstance = SupabaseStorage.createFromEnv()
    }
  }
  return defaultInstance
}

// Mock Supabase storage for build time
function createMockSupabaseStorage(): SupabaseStorage {
  return {
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    getClient: () => ({
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
      })
    }),
    getServiceClient: () => ({
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null })
      })
    })
  } as any
}

// Create and export instances only if configured
let supabaseStorage: SupabaseStorage | null = null

if (SupabaseStorage.isConfigured()) {
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
  supabaseStorage = new SupabaseStorage(config)
}

export { supabaseStorage }

// Legacy exports for compatibility
export const getSupabase = () => supabaseStorage?.client
export const supabaseService = supabaseStorage
export const supabase = supabaseStorage?.client