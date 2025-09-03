// Chat types for the unified chat system

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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  context?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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
