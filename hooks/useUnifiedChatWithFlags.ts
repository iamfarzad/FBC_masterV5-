/**
 * Unified Chat Hook with Feature Flags
 * Automatically chooses between legacy and native AI SDK based on feature flags
 */

import { useCallback, useMemo } from 'react'
import { useUnifiedChat } from './useUnifiedChat'
import { useNativeAISDK, type NativeAISDKOptions } from './useNativeAISDK'
import {
  shouldUseNativeAISDK,
  shouldUseEnhancedMetadata,
  shouldUseNativeTools,
  shouldFallbackToLegacy,
  shouldEnableDebugLogging,
  getMigrationStatus,
} from '@/src/core/feature-flags/ai-sdk-migration'
import type { UnifiedChatOptions, UnifiedChatReturn, UnifiedMessage } from '@/src/core/chat/unified-types'

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
  toolInvocations: any[]
  annotations: any[]
  // Native AI SDK methods (if available)
  append?: (message: UnifiedMessage) => Promise<void>
  reload?: () => Promise<void>
  nativeStop?: () => Promise<void>
  nativeSetMessages?: (messages: UnifiedMessage[]) => void
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

  const enableDebug = useMemo(() => {
    return shouldEnableDebugLogging(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  // Get migration status
  const migrationStatus = useMemo(() => {
    return getMigrationStatus(sessionId, userId, isAdmin)
  }, [sessionId, userId, isAdmin])

  // Legacy implementation
  const legacyOptions: UnifiedChatOptions = {
    mode: chatOptions.mode || 'standard',
  }

  if (sessionId) {
    legacyOptions.sessionId = sessionId
  }

  if (chatOptions.context) {
    legacyOptions.context = chatOptions.context
  }

  if (chatOptions.initialMessages) {
    legacyOptions.initialMessages = chatOptions.initialMessages
  }

  if (chatOptions.onMessage) {
    legacyOptions.onMessage = chatOptions.onMessage
  }

  if (chatOptions.onComplete) {
    legacyOptions.onComplete = chatOptions.onComplete
  }

  if (chatOptions.onError) {
    legacyOptions.onError = chatOptions.onError
  }

  const legacyChat = useUnifiedChat(legacyOptions)

  const nativeOptions: NativeAISDKOptions = {
    mode: chatOptions.mode || 'standard',
  }

  if (sessionId) {
    nativeOptions.sessionId = sessionId
  }

  if (chatOptions.context) {
    nativeOptions.context = chatOptions.context
  }

  if (chatOptions.initialMessages) {
    nativeOptions.initialMessages = chatOptions.initialMessages
  }

  if (chatOptions.onMessage) {
    nativeOptions.onMessage = chatOptions.onMessage
  }

  if (chatOptions.onComplete) {
    nativeOptions.onComplete = chatOptions.onComplete
  }

  if (chatOptions.onError) {
    nativeOptions.onError = chatOptions.onError
  }

  const nativeChat = useNativeAISDK(nativeOptions)

  // Choose the active implementation
  const activeChat = useNative ? nativeChat : legacyChat

  const messages = activeChat.messages

  const addMessage = useCallback((message: Omit<UnifiedMessage, 'id'> & { id?: string }) => {
    return useNative ? nativeChat.addMessage(message) : legacyChat.addMessage(message)
  }, [legacyChat, nativeChat, useNative])

  const setMessages = useCallback((nextMessages: UnifiedMessage[]) => {
    if (useNative) {
      nativeChat.setMessages(nextMessages)
    } else {
      legacyChat.setMessages(nextMessages)
    }
  }, [legacyChat, nativeChat, useNative])

  const stop = useCallback(async () => {
    if (useNative) {
      await nativeChat.stop()
    } else {
      await legacyChat.stop()
    }
  }, [legacyChat, nativeChat, useNative])

  const regenerate = useNative ? nativeChat.reload : legacyChat.regenerate
  const resumeStream = useNative ? nativeChat.resumeStream : legacyChat.resumeStream
  const addToolResult = useNative ? nativeChat.addToolResult : legacyChat.addToolResult
  const clearError = useNative ? nativeChat.clearError : legacyChat.clearError

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

  return {
    messages,
    isLoading: activeChat.isLoading,
    isStreaming: activeChat.isStreaming,
    error: activeChat.error,
    context: activeChat.context,
    sendMessage: activeChat.sendMessage,
    addMessage,
    clearMessages: activeChat.clearMessages,
    updateContext: activeChat.updateContext,
    stop,
    regenerate,
    resumeStream,
    addToolResult,
    setMessages,
    clearError,

    migrationStatus,
    toolInvocations: useNative ? nativeChat.toolInvocations : [],
    annotations: useNative ? nativeChat.annotations : [],
    ...(useNative
      ? {
          append: nativeChat.append,
          reload: nativeChat.reload,
          nativeStop: nativeChat.stop,
          nativeSetMessages: nativeChat.setMessages,
        }
      : {}),
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
