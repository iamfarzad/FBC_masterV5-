/**
 * React Hook for Feature Flags
 * Provides easy access to feature flags throughout the application
 * Replaces Vercel Edge Config with Supabase-based feature flags
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { FeatureFlag } from '@/src/core/supabase/vercel-replacements'

interface UseFeatureFlagsOptions {
  supabaseUrl?: string
  supabaseAnonKey?: string
  userId?: string
  environment?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface FeatureFlagsState {
  flags: Record<string, boolean>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  isEnabled: (flagKey: string) => boolean
  getFlag: (flagKey: string) => FeatureFlag | null
}

export function useFeatureFlags(options: UseFeatureFlagsOptions = {}): FeatureFlagsState {
  const {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    userId,
    environment = process.env.NODE_ENV || 'development',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [allFlags, setAllFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client
  const supabase = useCallback(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not provided')
    }
    return createClient(supabaseUrl, supabaseAnonKey)
  }, [supabaseUrl, supabaseAnonKey])

  // Check if a specific feature flag is enabled
  const isEnabled = useCallback((flagKey: string): boolean => {
    return flags[flagKey] || false
  }, [flags])

  // Get full flag data
  const getFlag = useCallback((flagKey: string): FeatureFlag | null => {
    return allFlags.find(flag => flag.flag_key === flagKey) || null
  }, [allFlags])

  // Fetch all feature flags
  const fetchFlags = useCallback(async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase credentials not configured')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const client = supabase()
      
      // Get all flags
      const { data: flagsData, error: flagsError } = await client
        .from('feature_flags')
        .select('*')
        .order('flag_key')

      if (flagsError) throw flagsError

      setAllFlags(flagsData || [])

      // Check each flag for the current user/environment
      const enabledFlags: Record<string, boolean> = {}
      
      for (const flag of flagsData || []) {
        if (!flag.is_enabled) {
          enabledFlags[flag.flag_key] = false
          continue
        }

        // Check environment targeting
        if (!flag.target_environments.includes(environment)) {
          enabledFlags[flag.flag_key] = false
          continue
        }

        // Check user targeting
        if (userId && flag.target_users && flag.target_users.length > 0) {
          if (flag.target_users.includes(userId)) {
            enabledFlags[flag.flag_key] = true
            continue
          }
        }

        // Check rollout percentage
        if (flag.rollout_percentage === 100) {
          enabledFlags[flag.flag_key] = true
        } else if (flag.rollout_percentage > 0) {
          // Simple hash-based rollout (can be improved)
          const userHash = userId ? Math.abs(hashCode(userId)) % 100 : 0
          enabledFlags[flag.flag_key] = userHash < flag.rollout_percentage
        } else {
          enabledFlags[flag.flag_key] = false
        }
      }

      setFlags(enabledFlags)
    } catch (err) {
      console.error('Failed to fetch feature flags:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags')
    } finally {
      setIsLoading(false)
    }
  }, [supabaseUrl, supabaseAnonKey, userId, environment, supabase])

  // Refresh flags manually
  const refresh = useCallback(async () => {
    await fetchFlags()
  }, [fetchFlags])

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchFlags, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchFlags])

  // Initial fetch
  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  // Set up real-time subscription for flag changes
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return

    const client = supabase()
    
    const subscription = client
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          // Refresh flags when any change occurs
          fetchFlags()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseUrl, supabaseAnonKey, fetchFlags, supabase])

  return {
    flags,
    isLoading,
    error,
    refresh,
    isEnabled,
    getFlag
  }
}

// Utility function for simple hash generation
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

// Hook for checking a single feature flag
export function useFeatureFlag(
  flagKey: string,
  options: UseFeatureFlagsOptions = {}
): { isEnabled: boolean; isLoading: boolean; error: string | null } {
  const { flags, isLoading, error } = useFeatureFlags(options)
  
  return {
    isEnabled: flags[flagKey] || false,
    isLoading,
    error
  }
}

// Hook for checking multiple feature flags
export function useFeatureFlagsMultiple(
  flagKeys: string[],
  options: UseFeatureFlagsOptions = {}
): { flags: Record<string, boolean>; isLoading: boolean; error: string | null } {
  const { flags, isLoading, error } = useFeatureFlags(options)
  
  const requestedFlags: Record<string, boolean> = {}
  flagKeys.forEach(key => {
    requestedFlags[key] = flags[key] || false
  })
  
  return {
    flags: requestedFlags,
    isLoading,
    error
  }
}

// Hook for admin feature flag management
export function useFeatureFlagsAdmin(options: UseFeatureFlagsOptions = {}) {
  const { supabaseUrl, supabaseAnonKey } = options
  
  const updateFlag = useCallback(async (
    flagKey: string,
    updates: Partial<FeatureFlag>
  ): Promise<boolean> => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not provided')
    }

    try {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error } = await client
        .from('feature_flags')
        .update(updates)
        .eq('flag_key', flagKey)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to update feature flag:', err)
      return false
    }
  }, [supabaseUrl, supabaseAnonKey])

  const toggleFlag = useCallback(async (
    flagKey: string,
    enabled: boolean
  ): Promise<boolean> => {
    return updateFlag(flagKey, { is_enabled: enabled })
  }, [updateFlag])

  const createFlag = useCallback(async (
    flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not provided')
    }

    try {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error } = await client
        .from('feature_flags')
        .insert(flag)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to create feature flag:', err)
      return false
    }
  }, [supabaseUrl, supabaseAnonKey])

  const deleteFlag = useCallback(async (
    flagKey: string
  ): Promise<boolean> => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not provided')
    }

    try {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error } = await client
        .from('feature_flags')
        .delete()
        .eq('flag_key', flagKey)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Failed to delete feature flag:', err)
      return false
    }
  }, [supabaseUrl, supabaseAnonKey])

  return {
    updateFlag,
    toggleFlag,
    createFlag,
    deleteFlag
  }
}
