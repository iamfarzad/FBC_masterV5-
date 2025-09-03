import { getSupabaseStorage } from '@/src/services/storage/supabase'
import type { ActivityItem } from "@/src/core/types/chat"

interface ServerActivityData {
  type: ActivityItem["type"]
  title: string
  description?: string
  status?: "pending" | "in_progress" | "completed" | "failed"
  metadata?: Record<string, unknown>
}

/**
 * Server-side activity logging function that integrates with the unified real-time activities system
 * This function logs activities directly to the database, which will be picked up by the real-time subscription
 */
export async function logServerActivity(activityData: ServerActivityData): Promise<string> {
  try {
    const serverSupabase = getSupabaseStorage().getClient()
    
    const { data, error } = await serverSupabase
      .from("activities")
      .insert({
        type: activityData.type,
        title: activityData.title,
        description: activityData.description || null,
        status: activityData.status || "completed",
        metadata: activityData.metadata || {}
      })
      .select("id")
      .single()

    if (error) {
      // Check if it's a missing table error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('relation "public.activities" does not exist')) {
        // Database table doesn't exist yet - using fallback ID
        return `console_fallback_${Date.now()}`
      }
      
      // Error: Failed to log server activity to database
      return `fallback_${Date.now()}`
    }

    // Activity logged to database
    return data.id
  } catch (error) {
    console.error('Server activity logging error', error)
    return `fallback_${Date.now()}`
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use logServerActivity instead
 */
export const logActivity = logServerActivity
