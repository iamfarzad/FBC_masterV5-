// 🔄 ATOMIC STATE MANAGEMENT
// WHY: Prevents race conditions and ensures consistent UI state
// BUSINESS IMPACT: No more UI bugs, no state corruption during demos

import type { ChatMessage } from '@/src/core/types/chat'

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: Error | null
  sessionId: string | null
  feature: 'chat' | 'webcam' | 'screen' | 'document' | 'video' | 'workshop'
  showProgressRail: boolean
  activities: Activity[]
  currentStage: number
  input: string
  showVoiceOverlay: boolean
  showCanvasOverlay: boolean
  showConsentOverlay: boolean
  hasConsent: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  timestamp: Date
}

export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'RECEIVE_MESSAGE'; payload: { message: ChatMessage } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: Error | null } }
  | { type: 'SET_FEATURE'; payload: { feature: ChatState['feature'] } }
  | { type: 'ADD_ACTIVITY'; payload: { activity: Omit<Activity, 'id' | 'timestamp'> } }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; updates: Partial<Activity> } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_SESSION_ID'; payload: { sessionId: string } }
  | { type: 'SET_INPUT'; payload: { input: string } }
  | { type: 'SET_VOICE_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CANVAS_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CONSENT_OVERLAY'; payload: { show: boolean } }
  | { type: 'SET_CONSENT'; payload: { hasConsent: boolean } }
  | { type: 'SET_THEME'; payload: { theme: ChatState['theme'] } }
  | { type: 'SET_CURRENT_STAGE'; payload: { stage: number } }

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          id: crypto.randomUUID(),
          role: 'user',
          content: action.payload.content,
          timestamp: new Date()
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
        feature: action.payload.feature,
        showProgressRail: action.payload.feature !== 'chat'
      }

    case 'ADD_ACTIVITY':
      const newActivity: Activity = {
        ...action.payload.activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }
      return {
        ...state,
        activities: [newActivity, ...state.activities].slice(0, 10) // Keep only last 10
      }

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.updates }
            : activity
        )
      }

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        activities: [],
        error: null,
        isLoading: false,
        currentStage: 1
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

    case 'SET_CURRENT_STAGE':
      return {
        ...state,
        currentStage: action.payload.stage
      }

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
    showProgressRail: false,
    activities: [],
    currentStage: 1,
    input: '',
    showVoiceOverlay: false,
    showCanvasOverlay: false,
    showConsentOverlay: false,
    hasConsent: false,
    theme: 'system'
  }
}

