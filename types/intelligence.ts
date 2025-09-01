export interface ToolRunResult {
  ok: boolean
  error?: string
  output?: unknown
  [key: string]: unknown
}

export interface IntelligenceContext {
  lead?: {
    email: string
    name?: string
  }
  company?: {
    name?: string
    industry?: string
  }
  person?: {
    fullName?: string
    role?: string
  }
  role?: string
  capabilities?: string[]
  stage?: number
  exploredCount?: number
  total?: number
}

export interface Suggestion {
  id: string
  capability: string
  label: string
  description?: string
}
