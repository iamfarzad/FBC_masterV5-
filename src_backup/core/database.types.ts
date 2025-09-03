export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string | null
          title: string | null
          created_at: string
          updated_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any> | null
        }
      }
      
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
          metadata?: Record<string, any> | null
        }
      }

      token_usage_logs: {
        Row: {
          id: string
          user_id: string | null
          model: string
          input_tokens: number
          output_tokens: number
          total_cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          model: string
          input_tokens: number
          output_tokens: number
          total_cost: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          model?: string
          input_tokens?: number
          output_tokens?: number
          total_cost?: number
          created_at?: string
        }
      }

      feature_flags: {
        Row: {
          id: string
          name: string
          enabled: boolean
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}