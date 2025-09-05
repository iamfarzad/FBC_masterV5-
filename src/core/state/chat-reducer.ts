// 🔄 ATOMIC STATE MANAGEMENT
// WHY: Prevents race conditions and ensures consistent UI state
// BUSINESS IMPACT: No more UI bugs, no state corruption during demos

import type { UnifiedMessage } from '@/src/core/chat/unified-types'

export interface ChatState {
  messages: UnifiedMessage[]
  isLoading: boolean
  error: Error | null
  sessionId: string | null
  feature: 'chat' | 'webcam' | 'screen' | 'document' | 'video' | 'workshop'
  input: string
  showVoiceOverlay: boolean
  showCanvasOverlay: boolean
  showConsentOverlay: boolean
  hasConsent: boolean
  theme: 'light' | 'dark' | 'system'
}

// Removed Activity interface - using ai-elements instead

export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: { message: UnifiedMessage } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: Error | null } }
  | { type: 'SET_FEATURE'; payload: { feature: ChatState['feature'] } }
  // Removed activity actions - using ai-elements instead
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_SESSION_ID'; payload: { sessionId: string } }
  | { type: 'SET_INPUT'; payload: { input: string } }
  | { type: 'SET_VOICE_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CANVAS_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CONSENT_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CONSENT'; payload: { hasConsent: boolean } }
  | { type: 'SET_THEME'; payload: { theme: ChatState['theme'] } }
  // Removed stage actions - using StageRail context instead

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          id: crypto.randomUUID(),
          role: 'user',
          content: action.payload.content,
          timestamp: new Date(),
          type: 'text'
        }],
        isLoading: true,
        error: null,
        input: '' // Clear input when sending
      }

    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
        isLoading: false
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.loading,
        error: action.payload.loading ? null : state.error
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false
      }

    case 'SET_FEATURE':
      return {
        ...state,
        feature: action.payload.feature
      }

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        error: null,
        isLoading: false
      }

    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload.sessionId
      }

    case 'SET_INPUT':
      return {
        ...state,
        input: action.payload.input
      }

    case 'SET_VOICE_OVERLAY':
      return {
        ...state,
        showVoiceOverlay: action.payload.show
      }

    case 'SET_CANVAS_OVERLAY':
      return {
        ...state,
        showCanvasOverlay: action.payload.show
      }

    case 'SET_CONSENT_OVERLAY':
      return {
        ...state,
        showConsentOverlay: action.payload.show
      }

    case 'SET_CONSENT':
      return {
        ...state,
        hasConsent: action.payload.hasConsent,
        showConsentOverlay: !action.payload.hasConsent
      }

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload.theme
      }

    // Removed stage handling - using StageRail context instead

    default:
      return state
  }
}

// Initial state factory
export function createInitialChatState(): ChatState {
  return {
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
    feature: 'chat',
    // showProgressRail removed: not in ChatState
    // currentStage removed: not in ChatState
    input: '',
    showVoiceOverlay: false,
    showCanvasOverlay: false,
    showConsentOverlay: false,
    hasConsent: false,
    theme: 'system'
  }
}

