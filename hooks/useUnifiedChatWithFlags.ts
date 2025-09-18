/**
 * Unified Chat Hook with Feature Flags
 * Automatically chooses between legacy and native AI SDK based on feature flags
 */

import { useCallback, useMemo } from 'react'
import { useUnifiedChat } from './useUnifiedChat'
import { useNativeAISDK } from './useNativeAISDK'
import { 
  shouldUseNativeAISDK,
  shouldUseEnhancedMetadata,
  shouldUseNativeTools,
  shouldFallbackToLegacy,
  getFallbackThreshold,
  shouldEnableDebugLogging,
  getMigrationStatus
} from '@/src/core/feature-flags/ai-sdk-migration'
import type { UnifiedChatOptions, UnifiedChatReturn } from '@/src/core/chat/unified-types'
import type { Message } from 'ai'

export interface UnifiedChatWithFlagsOptions extends UnifiedChatOptions {
  userId?: string
  isAdmin?: boolean
  forceLegacy?: boolean
  forceNative?: boolean
}

export interface UnifiedChatWithFlagsReturn extends UnifiedChatReturn {
  // Migration info
  migrationStatus: {
    phase: 'legacy' | 'hybrid' | 'native'
    features: string[]
    rollout: {
      admins: boolean
      users: boolean
      sessions: string[]
    }
  }
  // Native AI SDK specific (if available)
  toolInvocations?: any[]
  annotations?: any[]
  // Native AI SDK methods (if available)
  append?: (message: Message) => Promise<void>
  reload?: () => Promise<void>
  stop?: () => void
  setMessages?: (messages: Message[]) => void
}

export function useUnifiedChatWithFlags(
  options: UnifiedChatWithFlagsOptions
): UnifiedChatWithFlagsReturn {
  const {
    sessionId,
    userId,
    isAdmin = false,
    forceLegacy = false,
    forceNative = false,
    ...chatOptions
  } = options

  // Determine which implementation to use
  const useNative = useMemo(() => {
    if (forceLegacy) return false
    if (forceNative) return true
    return shouldUseNativeAISDK(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin, forceLegacy, forceNative])

  const useEnhanced = useMemo(() => {
    return shouldUseEnhancedMetadata(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  const useNativeTools = useMemo(() => {
    return shouldUseNativeTools(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  const enableFallback = useMemo(() => {
    return shouldFallbackToLegacy(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  const enableDebug = useMemo(() => {
    return shouldEnableDebugLogging(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  // Get migration status
  const migrationStatus = useMemo(() => {
    return getMigrationStatus(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  // Legacy implementation
  const legacyChat = useUnifiedChat({
    ...chatOptions,
    sessionId,
    mode: chatOptions.mode || 'standard',
  })

  // Native AI SDK implementation
  const nativeChat = useNativeAISDK({
    sessionId,
    mode: chatOptions.mode || 'standard',
    context: chatOptions.context,
    initialMessages: chatOptions.initialMessages?.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    onMessage: chatOptions.onMessage ? (message) => {
      chatOptions.onMessage?.({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(),
        type: 'text',
        metadata: {}
      })
    } : undefined,
    onComplete: chatOptions.onComplete,
    onError: chatOptions.onError,
  })

  // Error handling with fallback
  const handleError = useCallback((error: Error) => {
    if (enableDebug) {
      console.error('[UNIFIED_CHAT_FLAGS] Error:', error)
    }
    
    if (enableFallback && useNative) {
      console.warn('[UNIFIED_CHAT_FLAGS] Falling back to legacy implementation due to error:', error.message)
      // In a real implementation, you'd switch to legacy here
      // For now, we'll just log the fallback
    }
    
    chatOptions.onError?.(error)
  }, [enableFallback, useNative, chatOptions.onError, enableDebug])

  // Choose the active implementation
  const activeChat = useNative ? nativeChat : legacyChat

  // Debug logging
  if (enableDebug) {
    console.log('[UNIFIED_CHAT_FLAGS] Using implementation:', {
      useNative,
      useEnhanced,
      useNativeTools,
      sessionId,
      userId,
      isAdmin,
      migrationStatus,
    })
  }

  // Return unified interface
  return {
    // Core chat functionality
    messages: activeChat.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date(),
      type: msg.type || 'text',
      metadata: msg.metadata || {}
    })),
    isLoading: activeChat.isLoading,
    isStreaming: activeChat.isStreaming,
    error: activeChat.error,
    sendMessage: activeChat.sendMessage,
    addMessage: (message) => {
      const newMsg = activeChat.addMessage({
        id: message.id || crypto.randomUUID(),
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date(),
        type: message.type || 'text',
        metadata: message.metadata || {}
      })
      return {
        id: newMsg.id,
        role: newMsg.role,
        content: newMsg.content,
        timestamp: newMsg.timestamp,
        type: newMsg.type || 'text',
        metadata: newMsg.metadata || {}
      }
    },
    clearMessages: activeChat.clearMessages,
    updateContext: activeChat.updateContext,
    
    // Migration status
    migrationStatus,
    
    // Native AI SDK specific (if available)
    toolInvocations: useNative ? nativeChat.toolInvocations : undefined,
    annotations: useNative ? nativeChat.annotations : undefined,
    
    // Native AI SDK methods (if available)
    append: useNative ? nativeChat.append : undefined,
    reload: useNative ? nativeChat.reload : undefined,
    stop: useNative ? nativeChat.stop : undefined,
    setMessages: useNative ? nativeChat.setMessages : undefined,
  }
}

/**
 * Hook to get migration status without initializing chat
 */
export function useMigrationStatus(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
) {
  return useMemo(() => {
    return getMigrationStatus(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])
}

/**
 * Hook to check if native AI SDK is enabled
 */
export function useNativeAISDKEnabled(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
) {
  return useMemo(() => {
    return shouldUseNativeAISDK(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])
}

/**
 * Hook to get all feature flags
 */
export function useAISDKFeatureFlags(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
) {
  return useMemo(() => {
    return {
      useNativeAISDK: shouldUseNativeAISDK(sessionId, userId, isAdmin),
      useEnhancedMetadata: shouldUseEnhancedMetadata(sessionId, userId, isAdmin),
      useNativeTools: shouldUseNativeTools(sessionId, userId, isAdmin),
      enableFallback: shouldFallbackToLegacy(sessionId, userId, isAdmin),
      enableDebug: shouldEnableDebugLogging(sessionId, userId, isAdmin),
      migrationStatus: getMigrationStatus(sessionId, userId, isAdmin),
    }
  }, [sessionId, userId, isAdmin])
}
