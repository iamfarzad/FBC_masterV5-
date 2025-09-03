export interface TokenUsage {
  timestamp: Date
  model: string
  operation: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost?: number
  userId?: string
  conversationId?: string
}

export class TokenUsageLogger {
  private usage: TokenUsage[] = []
  private dailyLimits = new Map<string, number>()
  private currentUsage = new Map<string, number>()

  // Approximate costs per 1K tokens (in cents)
  private modelCosts = {
    'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
    'gemini-1.5-flash': { input: 0.00015, output: 0.0006 },
    'gemini-pro': { input: 0.00125, output: 0.00375 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
  }

  logUsage(usage: Omit<TokenUsage, 'timestamp'>): void {
    const fullUsage: TokenUsage = {
      ...usage,
      timestamp: new Date(),
      cost: this.calculateCost(usage.model, usage.inputTokens, usage.outputTokens)
    }

    this.usage.push(fullUsage)
    
    // Update current usage
    const userId = usage.userId || 'anonymous'
    const current = this.currentUsage.get(userId) || 0
    this.currentUsage.set(userId, current + fullUsage.totalTokens)
    
    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    this.usage = this.usage.filter(u => u.timestamp.getTime() > thirtyDaysAgo)
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = this.modelCosts[model as keyof typeof this.modelCosts]
    if (!costs) return 0

    const inputCost = (inputTokens / 1000) * costs.input
    const outputCost = (outputTokens / 1000) * costs.output
    
    return inputCost + outputCost
  }

  setDailyLimit(userId: string, limit: number): void {
    this.dailyLimits.set(userId, limit)
  }

  checkLimit(userId: string): { allowed: boolean; remaining: number } {
    const limit = this.dailyLimits.get(userId)
    if (!limit) return { allowed: true, remaining: Infinity }

    const todayUsage = this.getTodayUsage(userId)
    const remaining = limit - todayUsage
    
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    }
  }

  getTodayUsage(userId?: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = this.usage.filter(u => {
      const isToday = u.timestamp >= today
      const isUser = !userId || u.userId === userId
      return isToday && isUser
    })

    return todayUsage.reduce((sum, u) => sum + u.totalTokens, 0)
  }

  getUsageSummary(days: number = 7): {
    totalTokens: number
    totalCost: number
    byModel: Record<string, { tokens: number; cost: number }>
    byDay: Array<{ date: string; tokens: number; cost: number }>
  } {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentUsage = this.usage.filter(u => u.timestamp >= cutoffDate)
    
    const totalTokens = recentUsage.reduce((sum, u) => sum + u.totalTokens, 0)
    const totalCost = recentUsage.reduce((sum, u) => sum + (u.cost || 0), 0)
    
    // Group by model
    const byModel: Record<string, { tokens: number; cost: number }> = {}
    recentUsage.forEach(u => {
      if (!byModel[u.model]) {
        byModel[u.model] = { tokens: 0, cost: 0 }
      }
      byModel[u.model].tokens += u.totalTokens
      byModel[u.model].cost += u.cost || 0
    })
    
    // Group by day
    const byDay: Record<string, { tokens: number; cost: number }> = {}
    recentUsage.forEach(u => {
      const dateKey = u.timestamp.toISOString().split('T')[0]
      if (!byDay[dateKey]) {
        byDay[dateKey] = { tokens: 0, cost: 0 }
      }
      byDay[dateKey].tokens += u.totalTokens
      byDay[dateKey].cost += u.cost || 0
    })
    
    return {
      totalTokens,
      totalCost,
      byModel,
      byDay: Object.entries(byDay).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => a.date.localeCompare(b.date))
    }
  }

  getUserUsage(userId: string, days: number = 30): TokenUsage[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return this.usage.filter(u => 
      u.userId === userId && u.timestamp >= cutoffDate
    )
  }

  clear(): void {
    this.usage = []
    this.currentUsage.clear()
  }
}

export const tokenUsageLogger = new TokenUsageLogger()