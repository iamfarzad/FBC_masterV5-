import { createClient } from '@supabase/supabase-js'
import { MultimodalContext } from './multimodal-context'

export interface ConversationContext {
  session_id: string
  email: string
  name?: string
  company_url?: string
  company_context?: unknown
  person_context?: unknown
  role?: string
  role_confidence?: number
  intent_data?: unknown
  last_user_message?: string
  ai_capabilities_shown?: string[]
  tool_outputs?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export class ContextStorage {
  private supabase: unknown
  private inMemoryStorage = new Map<string, ConversationContext>()

  constructor() {
    // Try to create Supabase client, fallback to in-memory if unavailable
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
      } else {
        console.warn('⚠️ Supabase credentials not found, falling back to in-memory storage')
        this.supabase = null
      }
    } catch (error) {
      console.warn('⚠️ Supabase initialization failed, falling back to in-memory storage:', error)
      this.supabase = null
    }
  }

  async store(sessionId: string, payload: Partial<ConversationContext>): Promise<void> {
    try {
      const dataToStore: ConversationContext = {
        session_id: sessionId,
        ...payload,
        updated_at: new Date().toISOString()
      } as ConversationContext

      // Handle multimodal context
      if (dataToStore.multimodal_context) {
        dataToStore.multimodal_context = JSON.stringify(dataToStore.multimodal_context)
      }

      // Try Supabase first, fallback to in-memory
      if (this.supabase) {
        try {
          const { error } = await this.supabase
            .from('conversation_contexts')
            .upsert(dataToStore)

          if (error) {
            // If the column doesn't exist, try without multimodal_context
            if (error.message?.includes('multimodal_context') || error.message?.includes('tool_outputs')) {
              const { multimodal_context, tool_outputs, ...dataWithoutExtras } = dataToStore
              const { error: retryError } = await this.supabase
                .from('conversation_contexts')
                .upsert(dataWithoutExtras)

              if (retryError) {
                throw retryError
              }
            } else {
              throw error
            }
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase storage failed, falling back to in-memory:', supabaseError)
          this.inMemoryStorage.set(sessionId, dataToStore)
        }
      } else {
        // Use in-memory storage
        this.inMemoryStorage.set(sessionId, dataToStore)
      }
    } catch (error) {
      console.error('Context storage failed completely:', error)
      throw error
    }
  }

  async get(sessionId: string): Promise<ConversationContext | null> {
    try {
      // Try Supabase first, fallback to in-memory
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('conversation_contexts')
            .select('*')
            .eq('session_id', sessionId)
            .single()

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error
          }

          // Parse multimodal context if it exists as string
          if (data && typeof data.multimodal_context === 'string') {
            try {
              data.multimodal_context = JSON.parse(data.multimodal_context)
            } catch (parseError) {
              data.multimodal_context = undefined
            }
          }

          // If we got data from Supabase, also store in memory for faster access
          if (data) {
            this.inMemoryStorage.set(sessionId, data)
          }

          return data || null
        } catch (supabaseError) {
          console.warn('⚠️ Supabase retrieval failed, trying in-memory fallback:', supabaseError)
          return this.inMemoryStorage.get(sessionId) || null
        }
      } else {
        // Use in-memory storage only
        return this.inMemoryStorage.get(sessionId) || null
      }
    } catch (error) {
      console.error('Context retrieval failed completely:', error)
      return this.inMemoryStorage.get(sessionId) || null
    }
  }

  async update(sessionId: string, patch: Partial<ConversationContext>): Promise<void> {
    try {
      // Try Supabase first, fallback to in-memory
      if (this.supabase) {
        try {
          const { error } = await this.supabase
            .from('conversation_contexts')
            .update({
              ...patch,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)

          if (error) {
            throw error
          }

          // Also update in-memory cache if it exists
          const existing = this.inMemoryStorage.get(sessionId)
          if (existing) {
            this.inMemoryStorage.set(sessionId, { ...existing, ...patch, updated_at: new Date().toISOString() })
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase update failed, falling back to in-memory:', supabaseError)
          // Update in-memory storage
          const existing = this.inMemoryStorage.get(sessionId)
          if (existing) {
            this.inMemoryStorage.set(sessionId, { ...existing, ...patch, updated_at: new Date().toISOString() })
          } else {
            // Create new entry if it doesn't exist
            this.inMemoryStorage.set(sessionId, {
              session_id: sessionId,
              ...patch,
              updated_at: new Date().toISOString()
            } as ConversationContext)
          }
        }
      } else {
        // Use in-memory storage only
        const existing = this.inMemoryStorage.get(sessionId)
        if (existing) {
          this.inMemoryStorage.set(sessionId, { ...existing, ...patch, updated_at: new Date().toISOString() })
        } else {
          // Create new entry if it doesn't exist
          this.inMemoryStorage.set(sessionId, {
            session_id: sessionId,
            ...patch,
            updated_at: new Date().toISOString()
          } as ConversationContext)
        }
      }
    } catch (error) {
      console.error('Context update failed completely:', error)
      throw error
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      // Try Supabase first, then in-memory
      if (this.supabase) {
        try {
          const { error } = await this.supabase
            .from('conversation_contexts')
            .delete()
            .eq('session_id', sessionId)

          if (error) {
            throw error
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase delete failed:', supabaseError)
        }
      }

      // Always delete from in-memory storage
      this.inMemoryStorage.delete(sessionId)
    } catch (error) {
      console.error('Context deletion failed:', error)
      throw error
    }
  }
}

// Export singleton instance for backward compatibility
export const contextStorage = new ContextStorage()
