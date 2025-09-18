/**
 * AI SDK Tools Migration - Drop-in Replacement Hook
 * Provides exact same API as useUnifiedChat but with global state management
 */

import { useUnifiedChatStore } from './useUnifiedChatStore'
import {
  UnifiedChatOptions,
  UnifiedChatReturn
} from '@/src/core/chat/unified-types'

/**
 * Drop-in replacement for useUnifiedChat with AI SDK Tools global state
 * 
 * Features:
 * - Global state management with Zustand
 * - Optimized re-renders with selective subscriptions
 * - Better debugging with devtools
 * - Zero breaking changes - same API
 * 
 * @param options - Same options as original useUnifiedChat
 * @returns Same interface as original useUnifiedChat
 */
export function useUnifiedChatV2(options: UnifiedChatOptions): UnifiedChatReturn {
  return useUnifiedChatStore(options)
}

/**
 * Legacy compatibility hooks - DEPRECATED
 * These will be removed in Phase 6 cleanup
 * DO NOT USE in new code - use useUnifiedChatV2 instead
 */

export function useChatV2(options: Omit<UnifiedChatOptions, 'mode'>) {
  console.warn('⚠️ useChatV2 is DEPRECATED. Use useUnifiedChatV2 instead.')
  return useUnifiedChatV2({ ...options, mode: 'standard' })
}

export function useRealtimeChatV2(options: Omit<UnifiedChatOptions, 'mode'>) {
  console.warn('⚠️ useRealtimeChatV2 is DEPRECATED. Use useUnifiedChatV2 instead.')
  return useUnifiedChatV2({ ...options, mode: 'realtime' })
}
