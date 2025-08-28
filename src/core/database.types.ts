export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      token_usage_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          model: string
          input_tokens: number
          output_tokens: number
          total_tokens: number
          estimated_cost: number
          task_type: string
          endpoint: string
          success: boolean
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          model: string
          input_tokens?: number
          output_tokens?: number
          // total_tokens is a generated column - not included in Insert
          estimated_cost?: number
          task_type: string
          endpoint: string
          success?: boolean
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          model?: string
          input_tokens?: number
          output_tokens?: number
          total_tokens?: number
          estimated_cost?: number
          task_type?: string
          endpoint?: string
          success?: boolean
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_usage_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_budgets: {
        Row: {
          id: string
          user_id: string
          daily_limit: number
          monthly_limit: number
          per_request_limit: number
          user_plan: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          daily_limit?: number
          monthly_limit?: number
          per_request_limit?: number
          user_plan?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          daily_limit?: number
          monthly_limit?: number
          per_request_limit?: number
          user_plan?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_budgets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_summaries: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          email: string | null
          company: string | null
          phone: string | null
          industry: string | null
          company_size: string | null
          pain_points: string | null
          budget_range: string | null
          timeline: string | null
          decision_maker: boolean | null
          lead_score: number | null
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          email?: string | null
          company?: string | null
          phone?: string | null
          industry?: string | null
          company_size?: string | null
          pain_points?: string | null
          budget_range?: string | null
          timeline?: string | null
          decision_maker?: boolean | null
          lead_score?: number | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          email?: string | null
          company?: string | null
          phone?: string | null
          industry?: string | null
          company_size?: string | null
          pain_points?: string | null
          budget_range?: string | null
          timeline?: string | null
          decision_maker?: boolean | null
          lead_score?: number | null
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_summaries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_search_results: {
        Row: {
          id: string
          lead_id: string
          source: string
          url: string
          title: string
          snippet: string
          raw: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          source: string
          url: string
          title?: string
          snippet?: string
          raw?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          source?: string
          url?: string
          title?: string
          snippet?: string
          raw?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_search_results_lead_id_fkey"
            columns: ["lead_id"]
            referencedRelation: "lead_summaries"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_responses: {
        Row: {
          id: string
          session_id: string
          text: string | null
          audio_data: string | null
          image_data: string | null
          response_type: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          text?: string | null
          audio_data?: string | null
          image_data?: string | null
          response_type: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          text?: string | null
          audio_data?: string | null
          image_data?: string | null
          response_type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          name: string | null
          email: string | null
          summary: string | null
          lead_score: number | null
          research_json: Json | null
          pdf_url: string | null
          email_status: string | null
          email_retries: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          summary?: string | null
          lead_score?: number | null
          research_json?: Json | null
          pdf_url?: string | null
          email_status?: string | null
          email_retries?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          summary?: string | null
          lead_score?: number | null
          research_json?: Json | null
          pdf_url?: string | null
          email_status?: string | null
          email_retries?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      failed_emails: {
        Row: {
          id: string
          conversation_id: string
          failed_at: string
          failure_reason: string | null
          retries: number
          email_content: Json | null
          recipient_email: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          failed_at?: string
          failure_reason?: string | null
          retries?: number
          email_content?: Json | null
          recipient_email: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          failed_at?: string
          failure_reason?: string | null
          retries?: number
          email_content?: Json | null
          recipient_email?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_emails_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_conversations: {
        Row: {
          id: string
          conversation_id: string | null
          admin_id: string | null
          session_id: string
          message_type: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata: Json | null
          embeddings: number[] | null
          context_leads: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          admin_id?: string | null
          session_id: string
          message_type: 'user' | 'assistant' | 'system'
          message_content: string
          message_metadata?: Json | null
          embeddings?: number[] | null
          context_leads?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string | null
          admin_id?: string | null
          session_id?: string
          message_type?: 'user' | 'assistant' | 'system'
          message_content?: string
          message_metadata?: Json | null
          embeddings?: number[] | null
          context_leads?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_sessions: {
        Row: {
          id: string
          admin_id: string | null
          session_name: string | null
          last_activity: string | null
          context_summary: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          admin_id?: string | null
          session_name?: string | null
          last_activity?: string | null
          context_summary?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string | null
          session_name?: string | null
          last_activity?: string | null
          context_summary?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      failed_conversations: {
        Row: {
          failed_id: string | null
          failed_at: string | null
          retries: number | null
          failure_reason: string | null
          conversation_id: string | null
          name: string | null
          email: string | null
          summary: string | null
          lead_score: number | null
          research_json: Json | null
          pdf_url: string | null
          email_status: string | null
          conversation_created_at: string | null
        }
        Relationships: []
      }
      daily_token_usage: {
        Row: {
          user_id: string | null
          usage_date: string | null
          model: string | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_tokens: number | null
          total_cost: number | null
          request_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
