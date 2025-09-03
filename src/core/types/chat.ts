// Chat types for the unified chat system

export interface ChatChunk {
  id: string
  type: 'text' | 'tool' | 'done' | 'error'
  data: any
}

export interface ActivityItem {
  id: string
  type: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  content: string
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// Base message interface - foundation for all message types
export interface BaseMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Standard chat message with basic metadata
export interface ChatMessage extends BaseMessage {
  timestamp?: Date
  metadata?: Record<string, unknown>
}

// Main message type - consolidated from duplicates
export interface Message extends BaseMessage {
  createdAt: Date
  imageUrl?: string
  sources?: Array<{
    title?: string
    url: string
  }>
  videoToAppCard?: {
    videoUrl: string
    status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'error'
    sessionId: string
    progress?: number
    spec?: string
    code?: string
    error?: string
  }
  businessContent?: {
    type: 'roi_calculator' | 'lead_capture' | 'consultation_planner' | 'business_analysis' | 'proposal_generator' | 'educational_module'
    htmlContent: string
    context?: {
      industry?: string
      companySize?: string
      stage?: string
      customData?: Record<string, unknown>
    }
  }
}

// Unified message with advanced features - preferred for new code
export interface UnifiedMessage extends BaseMessage {
  type?: 'default' | 'code' | 'image' | 'analysis' | 'tool' | 'insight'
  metadata?: {
    timestamp?: Date
    edited?: boolean
    sources?: Array<{ url: string; title?: string; description?: string }>
    citations?: Array<{ uri: string; title?: string }>
    tools?: Array<{ type: string; data: unknown }>
    suggestions?: string[]
    imageUrl?: string
    activities?: Array<{ type: 'in' | 'out'; label: string }>
  }
  rendering?: {
    format?: 'markdown' | 'html' | 'plain'
    theme?: 'default' | 'code' | 'insight'
    showReasoning?: boolean
  }
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  context?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}


// Add ChatRequest type to match validation schema
export interface ChatRequest {
  version: 1
  messages: ChatMessage[]
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
}

export interface LeadContext {
  name?: string
  company?: string
  role?: string
  interests?: string
}

export interface LeadData {
  name?: string
  email?: string
  company?: string
  role?: string
  interests?: string
  engagementType: "demo" | "free-trial" | "sales-call"
}

// -------- Structured tool/event messages (chat pipeline) --------
export type ROIResultPayload = {
  roi: number
  paybackMonths: number | null
  netProfit: number
  monthlyProfit: number
  totalRevenue: number
  totalExpenses: number
  inputs: {
    initialInvestment: number
    monthlyRevenue: number
    monthlyExpenses: number
    timePeriod: number
    companySize?: string
    industry?: string
    useCase?: string
  }
  calculatedAt: string
}

export type StructuredChatMessage =
  | { role: "assistant"; type: "text"; content: string }
  | { role: "tool"; type: "roi.result"; payload: ROIResultPayload }
