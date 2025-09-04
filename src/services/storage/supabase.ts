import { getSupabaseServer, getSupabaseService } from '@/src/lib/supabase'

// Type guard for unknown values
function asRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x)
}

// Type for Supabase query results
type SupabaseResult = { data: unknown; error: unknown }

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
  private client: ReturnType<typeof getSupabaseServer>
  private serviceClient: ReturnType<typeof getSupabaseService> | null = null

  constructor(config: StorageConfig) {
    // Use typed clients
    this.client = getSupabaseServer()

    // Create service role client if available
    if (config.serviceRoleKey) {
      this.serviceClient = getSupabaseService()
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

    const config: StorageConfig = {
      url,
      anonKey,
      ...(serviceRoleKey ? { serviceRoleKey } : {})
    }

    return new SupabaseStorage(config)
  }

  // Basic CRUD operations
  async select(table: string, options?: {
    columns?: string
    filter?: Record<string, unknown>
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
  }): Promise<StorageResult> {
    try {
      let query = this.from(table).select(options?.columns || '*')

      if (options?.filter && asRecord(options.filter)) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value)
        }
      }

      if (options?.orderBy && asRecord(options.orderBy)) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const result: SupabaseResult = await query

      // Guard against error before using data
      if (result.error) {
        return { data: null, error: asRecord(result.error) && typeof result.error.message === 'string'
          ? new Error(result.error.message)
          : new Error('Query failed') }
      }

      return { data: result.data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async insert(table: string, data: unknown): Promise<StorageResult> {
    try {
      const result: SupabaseResult = await this.from(table).insert(data).select()

      if (result.error) {
        return { data: null, error: asRecord(result.error) && typeof result.error.message === 'string'
          ? new Error(result.error.message)
          : new Error('Insert failed') }
      }

      return { data: result.data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async update(table: string, data: unknown, filter: Record<string, unknown>): Promise<StorageResult> {
    try {
      let query = this.from(table).update(data)

      if (asRecord(filter)) {
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value)
        }
      }

      const result: SupabaseResult = await query.select()

      if (result.error) {
        return { data: null, error: asRecord(result.error) && typeof result.error.message === 'string'
          ? new Error(result.error.message)
          : new Error('Update failed') }
      }

      return { data: result.data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async delete(table: string, filter: Record<string, unknown>): Promise<StorageResult> {
    try {
      let query = this.from(table).delete()

      if (asRecord(filter)) {
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value)
        }
      }

      const result: SupabaseResult = await query

      if (result.error) {
        return { data: null, error: asRecord(result.error) && typeof result.error.message === 'string'
          ? new Error(result.error.message)
          : new Error('Delete failed') }
      }

      return { data: result.data, error: null }
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

  // Public wrappers for external access (avoiding private field access)
  public from(table: string) {
    return this.client.from(table)
  }

  public get storage() {
    return this.client.storage
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const config: StorageConfig = {
    url,
    anonKey,
    ...(serviceRoleKey ? { serviceRoleKey } : {})
  }
  supabaseStorage = new SupabaseStorage(config)
}

export { supabaseStorage }

// Legacy exports for compatibility
export const getSupabase = () => supabaseStorage
export const supabaseService = supabaseStorage
export const supabase = supabaseStorage