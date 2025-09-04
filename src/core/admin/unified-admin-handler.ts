
import { NextRequest } from 'next/server'
import { getSupabaseStorage } from '@/src/services/storage/supabase'
import { adminAuthMiddleware } from '@/app/api-utils/auth'
import { adminRateLimit } from '@/app/api-utils/rate-limiting'
import { ErrorResponses } from '../api/unified-route-handler'

export interface AdminQueryConfig {
  table: string
  select?: string
  timeRange?: number // hours
  limit?: number
  orderBy?: { column: string; ascending?: boolean }
  filters?: Array<{ column: string; operator: string; value: any }>
}

export function createAdminHandler(queryConfig: AdminQueryConfig) {
  return async function(request: NextRequest) {
    // Rate limiting
    const rateLimitResult = adminRateLimit(request)
    if (rateLimitResult) return rateLimitResult

    // Authentication
    const authResult = await adminAuthMiddleware(request)
    if (authResult) return authResult

    try {
      const supabase = getSupabaseStorage()
      let query = supabase.from(queryConfig.table)

      // Select fields
      if (queryConfig.select) {
        query = query.select(queryConfig.select)
      } else {
        query = query.select('*')
      }

      // Time range filter
      if (queryConfig.timeRange) {
        const timeAgo = new Date(Date.now() - queryConfig.timeRange * 60 * 60 * 1000)
        query = query.gte('created_at', timeAgo.toISOString())
      }

      // Custom filters
      if (queryConfig.filters) {
        for (const filter of queryConfig.filters) {
          query = query.filter(filter.column, filter.operator, filter.value)
        }
      }

      // Ordering
      if (queryConfig.orderBy) {
        query = query.order(queryConfig.orderBy.column, { 
          ascending: queryConfig.orderBy.ascending ?? false 
        })
      }

      // Limit
      if (queryConfig.limit) {
        query = query.limit(queryConfig.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Admin query error (${queryConfig.table}):`, error)
        return ErrorResponses.serverError('Database query failed')
      }

      return Response.json({ 
        success: true, 
        data,
        timestamp: new Date().toISOString(),
        count: data?.length || 0
      })

    } catch (error) {
      console.error(`Admin handler error (${queryConfig.table}):`, error)
      return ErrorResponses.serverError()
    }
  }
}

// Pre-configured admin handlers
export const AdminHandlers = {
  recentLeads: createAdminHandler({
    table: 'lead_summaries',
    timeRange: 24,
    limit: 50,
    orderBy: { column: 'created_at', ascending: false }
  }),

  recentActivities: createAdminHandler({
    table: 'activities',
    timeRange: 24,
    limit: 100,
    orderBy: { column: 'created_at', ascending: false }
  }),

  tokenUsage: createAdminHandler({
    table: 'token_usage_logs',
    timeRange: 24,
    limit: 200,
    orderBy: { column: 'created_at', ascending: false }
  }),

  conversations: createAdminHandler({
    table: 'conversations',
    timeRange: 168, // 1 week
    limit: 100,
    orderBy: { column: 'updated_at', ascending: false }
  })
}
