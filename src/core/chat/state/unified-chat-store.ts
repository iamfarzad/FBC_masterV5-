import {
  type ChatStore,
  getChatStore,
  useChatMessages,
  useChatStatus,
  useChatError,
  useChatSendMessage,
  useChatMessageCount,
  useChatActions,
  useChatProperty,
} from '@ai-sdk-tools/store'

export const UNIFIED_CHAT_STORE_ID = 'unified-ai-sdk'

export type UnifiedChatStore = ChatStore<any>

type PartialUnifiedStore = Partial<UnifiedChatStore>

export function syncUnifiedChatStoreState(
  partial: PartialUnifiedStore,
  storeId: string = UNIFIED_CHAT_STORE_ID,
): void {
  const store = getChatStore<any>(storeId)

  if (typeof store._syncState === 'function') {
    store._syncState(partial)
    return
  }

  if (typeof store.setState === 'function') {
    store.setState(partial)
  }
}

export function useUnifiedChatMessages(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatMessages<any>(storeId)
}

export function useUnifiedChatStatus(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatStatus(storeId)
}

export function useUnifiedChatError(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatError(storeId)
}

export function useUnifiedChatSendMessage(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatSendMessage(storeId)
}

export function useUnifiedChatMessageCount(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatMessageCount(storeId)
}

export function useUnifiedChatActions(storeId: string = UNIFIED_CHAT_STORE_ID) {
  return useChatActions(storeId)
}

export function useUnifiedChatSelector<T>(
  selector: (state: UnifiedChatStore) => T,
  storeId: string = UNIFIED_CHAT_STORE_ID,
): T {
  return useChatProperty<any, T>(selector, storeId)
}
