// Main component
export { AdminChatInterface } from '../AdminChatInterface'

// Extracted components
export { QuickActions } from './QuickActions'
export { AdminChatUI } from './AdminChatUI'
export { ConversationSelector } from './ConversationSelector'
export { useConversationContext } from './ConversationContextManager'
export { useAdminMessageHandler } from './AdminMessageHandler'
export { isSystemStatusQuery, formatSystemStatusResponse } from './SystemStatusHandler'

// Configuration
export { QUICK_ACTIONS, SUGGESTED_PROMPTS } from './QuickActionsConfig'

// Types
export type { AdminMessage } from './AdminMessageHandler'
export type { Conversation } from './ConversationContextManager'
export type { QuickAction } from './QuickActionsConfig'
