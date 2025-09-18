"use client"

import React, { useCallback, useMemo } from 'react'
import { useUnifiedChatWithFlags, useMigrationStatus } from '@/hooks/useUnifiedChatWithFlags'
import { AiElementsConversation } from '@/components/chat/AiElementsConversation'
import { NativeAISDKConversation } from '@/components/chat/NativeAISDKConversation'
// Removed mapper import - using native AI SDK types directly
import type { UnifiedChatOptions } from '@/src/core/chat/unified-types'
import type { UIMessage as Message } from 'ai'

export interface UnifiedChatWithFlagsProps extends UnifiedChatOptions {
  userId?: string
  isAdmin?: boolean
  forceLegacy?: boolean
  forceNative?: boolean
  emptyState?: React.ReactNode
  onSuggestionClick?: (suggestion: string) => void
  onMessageAction?: (action: 'copy' | 'regenerate', messageId: string) => void
  showMigrationStatus?: boolean
}

export function UnifiedChatWithFlags({
  userId,
  isAdmin = false,
  forceLegacy = false,
  forceNative = false,
  emptyState,
  onSuggestionClick,
  onMessageAction,
  showMigrationStatus = false,
  ...chatOptions
}: UnifiedChatWithFlagsProps) {
  // Get migration status
  const migrationStatus = useMigrationStatus(chatOptions.sessionId, userId, isAdmin)

  // Use the unified chat hook with feature flags
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    updateContext,
    migrationStatus: chatMigrationStatus,
    toolInvocations,
    annotations,
    append,
    reload,
    stop,
    setMessages,
  } = useUnifiedChatWithFlags({
    ...chatOptions,
    userId,
    isAdmin,
    forceLegacy,
    forceNative,
  })

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion)
    } else {
      // Default behavior: send the suggestion as a message
      sendMessage(suggestion)
    }
  }, [onSuggestionClick, sendMessage])

  // Handle message actions
  const handleMessageAction = useCallback((action: 'copy' | 'regenerate', messageId: string) => {
    if (onMessageAction) {
      onMessageAction(action, messageId)
    } else {
      // Default behavior
      if (action === 'copy') {
        const message = messages.find(msg => msg.id === messageId)
        if (message) {
          navigator.clipboard.writeText(message.content)
        }
      } else if (action === 'regenerate' && reload) {
        reload()
      }
    }
  }, [onMessageAction, messages, reload])

  // Determine which conversation component to use
  const useNativeConversation = useMemo(() => {
    if (forceLegacy) return false
    if (forceNative) return true
    return chatMigrationStatus.phase === 'native' || chatMigrationStatus.features.includes('native-ai-sdk')
  }, [forceLegacy, forceNative, chatMigrationStatus])

  // Convert messages for legacy conversation component (using native AI SDK types)
  const legacyMessages = useMemo(() => {
    if (useNativeConversation) return []
    // Convert UnifiedMessage to AiChatMessage format for legacy component
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      displayRole: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      isComplete: msg.metadata?.isComplete ?? true,
      suggestions: msg.metadata?.suggestions || [],
      sources: msg.metadata?.sources || [],
      reasoning: msg.metadata?.reasoning,
      tools: msg.metadata?.tools || [],
      tasks: msg.metadata?.tasks || [],
      citations: msg.metadata?.citations || [],
      metadata: msg.metadata || {}
    }))
  }, [messages, useNativeConversation])

  // Convert messages for native conversation component
  const nativeMessages = useMemo(() => {
    if (!useNativeConversation) return []
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))
  }, [messages, useNativeConversation])

  // Render migration status if requested
  const migrationStatusDisplay = showMigrationStatus ? (
    <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
      <div className="font-medium">Migration Status: {chatMigrationStatus.phase}</div>
      <div className="text-muted-foreground">
        Features: {chatMigrationStatus.features.join(', ') || 'none'}
      </div>
      <div className="text-muted-foreground">
        Rollout: Admins {chatMigrationStatus.rollout.admins ? '✅' : '❌'}, 
        Users {chatMigrationStatus.rollout.users ? '✅' : '❌'}
      </div>
    </div>
  ) : null

  return (
    <div className="w-full">
      {migrationStatusDisplay}
      
      {useNativeConversation ? (
        <NativeAISDKConversation
          messages={nativeMessages}
          toolInvocations={toolInvocations}
          annotations={annotations}
          onSuggestionClick={handleSuggestionClick}
          onMessageAction={handleMessageAction}
          emptyState={emptyState}
        />
      ) : (
        <AiElementsConversation
          messages={legacyMessages}
          onSuggestionClick={handleSuggestionClick}
          onMessageAction={handleMessageAction}
          emptyState={emptyState}
        />
      )}
    </div>
  )
}

/**
 * Hook to get just the migration status without rendering
 */
export function useUnifiedChatMigrationStatus(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
) {
  return useMigrationStatus(sessionId, userId, isAdmin)
}

/**
 * Hook to check if native AI SDK is being used
 */
export function useUnifiedChatNativeEnabled(
  sessionId?: string,
  userId?: string,
  isAdmin: boolean = false
) {
  const migrationStatus = useMigrationStatus(sessionId, userId, isAdmin)
  return migrationStatus.phase === 'native' || migrationStatus.features.includes('native-ai-sdk')
}
