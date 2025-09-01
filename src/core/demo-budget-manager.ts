// Minimal demo budget manager replacement (most functions removed)
export type DemoFeature = 'chat' | 'tools' | 'voice' | 'webcam' | 'screen'

export const DEMO_LIMITS = {
  maxTokens: 100000,
  maxRequests: 50,
  maxSessions: 10
}

export const FEATURE_BUDGETS: Record<DemoFeature, number> = {
  chat: 5000,
  tools: 2000, 
  voice: 1000,
  webcam: 500,
  screen: 500
}

export async function getDemoSession(sessionId: string) {
  return { 
    id: sessionId, 
    tokensUsed: 0, 
    requestsUsed: 0, 
    isActive: true,
    remainingTokens: DEMO_LIMITS.maxTokens 
  }
}

export async function checkDemoAccess(sessionId: string, feature: DemoFeature) {
  return { allowed: true, reason: null, remainingTokens: DEMO_LIMITS.maxTokens }
}

export async function recordDemoUsage(sessionId: string, feature: DemoFeature, tokens: number) {
  return { success: true }
}
