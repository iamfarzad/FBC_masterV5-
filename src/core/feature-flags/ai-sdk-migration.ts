/**
 * AI SDK Migration Feature Flags
 * Controls gradual rollout between legacy and native AI SDK implementations
 */

export interface AISDKMigrationFlags {
  // Core migration flags
  useNativeAISDK: boolean
  useEnhancedMetadata: boolean
  useNativeTools: boolean
  useDedicatedStore: boolean
  
  // Rollout controls
  enableForAdmins: boolean
  enableForUsers: boolean
  enableForSpecificSessions: string[]
  
  // Fallback controls
  fallbackToLegacy: boolean
  fallbackThreshold: number // Error rate threshold for fallback
  
  // Performance monitoring
  enablePerformanceMonitoring: boolean
  enableDebugLogging: boolean
}

// Default configuration
const DEFAULT_FLAGS: AISDKMigrationFlags = {
  // Core migration flags - start with legacy
  useNativeAISDK: false,
  useEnhancedMetadata: true, // Enable enhanced metadata even with legacy
  useNativeTools: false,
  useDedicatedStore: false,
  
  // Rollout controls - start with admins only
  enableForAdmins: true,
  enableForUsers: false,
  enableForSpecificSessions: [],
  
  // Fallback controls
  fallbackToLegacy: true,
  fallbackThreshold: 0.1, // 10% error rate
  
  // Performance monitoring
  enablePerformanceMonitoring: true,
  enableDebugLogging: false,
}

// Environment-based overrides
const ENV_OVERRIDES: Partial<AISDKMigrationFlags> = {
  // Enable native AI SDK in development
  useNativeAISDK: process.env.NODE_ENV === 'development' && process.env.ENABLE_NATIVE_AI_SDK === 'true',
  
  // Enable for specific users in production
  enableForAdmins: process.env.ENABLE_AI_SDK_FOR_ADMINS !== 'false',
  enableForUsers: process.env.ENABLE_AI_SDK_FOR_USERS === 'true',
  
  // Debug logging in development
  enableDebugLogging: process.env.NODE_ENV === 'development',
}

// Session-based overrides (for testing)
const SESSION_OVERRIDES: Record<string, Partial<AISDKMigrationFlags>> = {
  // Test sessions
  'test-native-ai-sdk': {
    useNativeAISDK: true,
    useEnhancedMetadata: true,
    useNativeTools: true,
    enableDebugLogging: true,
  },
  'test-enhanced-metadata': {
    useEnhancedMetadata: true,
    enableDebugLogging: true,
  },
  'test-fallback': {
    useNativeAISDK: true,
    fallbackToLegacy: true,
    fallbackThreshold: 0.05, // 5% error rate
  },
}

// User-based overrides (for gradual rollout)
const USER_OVERRIDES: Record<string, Partial<AISDKMigrationFlags>> = {
  // Admin users
  'admin@fbc.com': {
    useNativeAISDK: true,
    useEnhancedMetadata: true,
    useNativeTools: true,
    enableDebugLogging: true,
  },
  // Beta testers
  'beta@fbc.com': {
    useNativeAISDK: true,
    useEnhancedMetadata: true,
    enableDebugLogging: true,
  },
}

/**
 * Get feature flags for a specific session
 */
export function getAISDKMigrationFlags(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): AISDKMigrationFlags {
  let flags = { ...DEFAULT_FLAGS, ...ENV_OVERRIDES }
  
  // Apply session-based overrides
  if (sessionId && SESSION_OVERRIDES[sessionId]) {
    flags = { ...flags, ...SESSION_OVERRIDES[sessionId] }
  }
  
  // Apply user-based overrides
  if (userId && USER_OVERRIDES[userId]) {
    flags = { ...flags, ...USER_OVERRIDES[userId] }
  }
  
  // Apply admin-specific overrides
  if (isAdmin) {
    flags = {
      ...flags,
      enableForAdmins: true,
      useEnhancedMetadata: true,
      enableDebugLogging: true,
    }
  }
  
  return flags
}

/**
 * Check if native AI SDK should be used
 */
export function shouldUseNativeAISDK(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  
  // Check if user type is enabled
  if (isAdmin && !flags.enableForAdmins) return false
  if (!isAdmin && !flags.enableForUsers) return false
  
  // Check if specific session is enabled
  if (sessionId && flags.enableForSpecificSessions.includes(sessionId)) return true
  
  return flags.useNativeAISDK
}

/**
 * Check if enhanced metadata should be used
 */
export function shouldUseEnhancedMetadata(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.useEnhancedMetadata
}

/**
 * Check if native tools should be used
 */
export function shouldUseNativeTools(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.useNativeTools
}

/**
 * Check if dedicated store should be used
 */
export function shouldUseDedicatedStore(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.useDedicatedStore
}

/**
 * Check if fallback to legacy should be enabled
 */
export function shouldFallbackToLegacy(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.fallbackToLegacy
}

/**
 * Get fallback threshold
 */
export function getFallbackThreshold(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): number {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.fallbackThreshold
}

/**
 * Check if performance monitoring should be enabled
 */
export function shouldEnablePerformanceMonitoring(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.enablePerformanceMonitoring
}

/**
 * Check if debug logging should be enabled
 */
export function shouldEnableDebugLogging(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): boolean {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  return flags.enableDebugLogging
}

/**
 * Get all flags for debugging
 */
export function getDebugFlags(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): AISDKMigrationFlags {
  return getAISDKMigrationFlags(sessionId, userId, isAdmin)
}

/**
 * Update flags for a specific session (for testing)
 */
export function updateSessionFlags(
  sessionId: string,
  updates: Partial<AISDKMigrationFlags>
): void {
  SESSION_OVERRIDES[sessionId] = {
    ...SESSION_OVERRIDES[sessionId],
    ...updates,
  }
}

/**
 * Clear session flags
 */
export function clearSessionFlags(sessionId: string): void {
  delete SESSION_OVERRIDES[sessionId]
}

/**
 * Get migration status for monitoring
 */
export function getMigrationStatus(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
): {
  phase: 'legacy' | 'hybrid' | 'native'
  features: string[]
  rollout: {
    admins: boolean
    users: boolean
    sessions: string[]
  }
} {
  const flags = getAISDKMigrationFlags(sessionId, userId, isAdmin)
  
  let phase: 'legacy' | 'hybrid' | 'native' = 'legacy'
  if (flags.useNativeAISDK && flags.useNativeTools && flags.useDedicatedStore) {
    phase = 'native'
  } else if (flags.useEnhancedMetadata || flags.useNativeAISDK) {
    phase = 'hybrid'
  }
  
  const features: string[] = []
  if (flags.useNativeAISDK) features.push('native-ai-sdk')
  if (flags.useEnhancedMetadata) features.push('enhanced-metadata')
  if (flags.useNativeTools) features.push('native-tools')
  if (flags.useDedicatedStore) features.push('dedicated-store')
  if (flags.enablePerformanceMonitoring) features.push('performance-monitoring')
  if (flags.enableDebugLogging) features.push('debug-logging')
  
  return {
    phase,
    features,
    rollout: {
      admins: flags.enableForAdmins,
      users: flags.enableForUsers,
      sessions: flags.enableForSpecificSessions,
    },
  }
}
