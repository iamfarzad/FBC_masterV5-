export interface ConversationContext {
  session_id: string
  email: string
  name?: string
  company_url?: string
  company_context?: unknown
  person_context?: unknown
  role?: string
  role_confidence?: number
  intent_data?: unknown
  last_user_message?: string
  ai_capabilities_shown?: string[]
  tool_outputs?: Record<string, unknown>
  multimodal_context?: MultimodalContext // Add this here
  created_at?: string
  updated_at?: string
}

export interface MultimodalContext {
  sessionId: string
  conversationHistory: ConversationEntry[]
  visualContext: VisualEntry[]
  audioContext: AudioEntry[]
  leadContext?: LeadContext
  metadata: {
    createdAt: string
    lastUpdated: string
    modalitiesUsed: string[]
    totalTokens: number
  }
}

export interface ConversationEntry {
  id: string
  timestamp: string
  modality: 'text' | 'voice' | 'vision'
  content: string
  metadata?: {
    duration?: number // for audio
    imageSize?: number // for images
    confidence?: number // for analysis
    transcription?: string // for voice
  }
}

export interface VisualEntry {
  id: string
  timestamp: string
  type: 'webcam' | 'screen' | 'upload'
  analysis: string
  imageData?: string // base64, stored temporarily
  metadata: {
    size: number
    format: string
    confidence: number
  }
}

export interface AudioEntry {
  id: string
  timestamp: string
  duration: number
  transcription: string
  metadata: {
    sampleRate: number
    format: string
    confidence: number
  }
}

export interface LeadContext {
  name?: string
  email?: string
  company?: string
  role?: string
  interests?: string[]
  challenges?: string[]
}