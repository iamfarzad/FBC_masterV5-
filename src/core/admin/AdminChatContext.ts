// 🤖 ADMIN CHAT CONTEXT - Intelligent System Status Queries
// WHY: Let admins ask "how things are" and get comprehensive system health
// BUSINESS IMPACT: Quick insights without clicking through multiple dashboards

import { performanceMonitor } from '../monitoring/performance-monitor'
import { safeStorage } from '../storage/safe-storage'
import { browserFeatures } from '../browser/feature-detection'
import { tabSync } from '../state/tab-sync'
import { streamingOptimizer } from '../streaming/streaming-optimizer'
import { advancedCache } from '../cache/advanced-cache'

export interface AdminQuery {
  question: string
  context?: string
  priority?: 'low' | 'normal' | 'high'
}

export interface AdminResponse {
  answer: string
  metrics: Record<string, any>
  recommendations: string[]
  severity: 'good' | 'warning' | 'critical'
  timestamp: number
}

export class AdminChatContext {
  private queryPatterns = {
    // System Health Queries
    health: /(?:how|what).*(?:health|status|condition|working)/i,
    performance: /(?:how|what).*(?:performance|speed|fast|slow)/i,
    memory: /(?:how|what).*(?:memory|ram|usage)/i,
    cache: /(?:how|what).*(?:cache|caching|stored)/i,
    streaming: /(?:how|what).*(?:stream|streaming|real.?time)/i,
    storage: /(?:how|what).*(?:storage|localStorage|data)/i,
    browser: /(?:how|what).*(?:browser|compatibility|device)/i,
    tabs: /(?:how|what).*(?:tab|tabs|sync|synchronize)/i,

    // Error Queries
    errors: /(?:any|what).*(?:error|problem|issue|fail)/i,
    crashes: /(?:crash|crashed|breaking|broken)/i,

    // Resource Queries
    resources: /(?:resource|load|busy|utilization)/i,
    metrics: /(?:metric|statistic|number|count)/i,

    // General Status
    overall: /(?:overall|summary|everything|all|comprehensive)/i,
    quick: /(?:quick|brief|short|tl.?dr)/i
  }

  /**
   * Process admin queries and return intelligent responses
   */
  async processQuery(query: AdminQuery): Promise<AdminResponse> {
    const { question, context = 'general', priority = 'normal' } = query

    try {
      // Gather all system metrics
      const metrics = await this.gatherAllMetrics()

      // Determine query intent
      const intent = this.determineIntent(question)

      // Generate response based on intent
      const response = await this.generateResponse(intent, metrics, question)

      return {
        answer: response.answer,
        metrics: response.metrics,
        recommendations: response.recommendations,
        severity: this.calculateSeverity(metrics),
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        answer: `I encountered an error while checking system status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metrics: {},
        recommendations: ['Check system logs', 'Restart monitoring services'],
        severity: 'critical',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Gather comprehensive system metrics
   */
  private async gatherAllMetrics() {
    const [
      performance,
      memory,
      cache,
      streaming,
      storage,
      browser,
      tabs
    ] = await Promise.all([
      performanceMonitor.getPerformanceSummary(),
      performanceMonitor.getMemoryUsage(),
      advancedCache.getCacheMetrics(),
      streamingOptimizer.getStreamHealth(),
      safeStorage.getUsageInfo(),
      Promise.resolve(browserFeatures.getBrowserInfo()),
      Promise.resolve({
        activeTabs: tabSync.getActiveTabs().length,
        isPrimaryTab: tabSync.isPrimaryTab()
      })
    ])

    return {
      performance,
      memory,
      cache,
      streaming,
      storage: storage.success ? storage.data : null,
      browser,
      tabs,
      healthScore: this.calculateHealthScore({ performance, memory, cache, streaming, storage, browser, tabs, errors: [] })
    }
  }

  /**
   * Determine the intent of the admin query
   */
  private determineIntent(question: string): string[] {
    const intents: string[] = []

    for (const [intent, pattern] of Object.entries(this.queryPatterns)) {
      if (pattern.test(question)) {
        intents.push(intent)
      }
    }

    // If no specific intent found, default to overall
    if (intents.length === 0) {
      intents.push('overall')
    }

    return intents
  }

  /**
   * Generate intelligent response based on query intent
   */
  private async generateResponse(
    intents: string[],
    metrics: any,
    originalQuestion: string
  ): Promise<{ answer: string; metrics: any; recommendations: string[] }> {

    // Handle quick status requests
    if (intents.includes('quick')) {
      return {
        answer: this.generateQuickStatus(metrics),
        metrics: {
          healthScore: metrics.healthScore,
          activeStreams: metrics.streaming.activeStreams,
          memoryUsage: `${(metrics.memory.used / (1024 * 1024)).toFixed(1)  }MB`
        },
        recommendations: this.generateQuickRecommendations(metrics)
      }
    }

    // Handle comprehensive requests
    if (intents.includes('overall') || intents.length > 3) {
      return {
        answer: this.generateComprehensiveStatus(metrics),
        metrics,
        recommendations: this.generateComprehensiveRecommendations(metrics)
      }
    }

    // Handle specific category requests
    return {
      answer: this.generateSpecificResponse(intents, metrics),
      metrics: this.extractRelevantMetrics(intents, metrics),
      recommendations: this.generateTargetedRecommendations(intents, metrics)
    }
  }

  private generateQuickStatus(metrics: any): string {
    const healthScore = metrics.healthScore
    const memoryUsage = (metrics.memory.used / (1024 * 1024)).toFixed(1)
    const activeStreams = metrics.streaming.activeStreams
    const cacheHitRate = (metrics.cache.hitRate * 100).toFixed(1)

    let status = "🟢 System is healthy"
    if (healthScore < 60) status = "🔴 System needs attention"
    else if (healthScore < 80) status = "🟡 System has minor issues"

    return `${status} (${healthScore}/100)
• Memory: ${memoryUsage}MB used
• Active streams: ${activeStreams}
• Cache hit rate: ${cacheHitRate}%
• ${metrics.tabs.activeTabs} tabs active`
  }

  private generateComprehensiveStatus(metrics: any): string {
    const healthScore = metrics.healthScore
    const avgResponseTime = metrics.performance.averageResponseTime.toFixed(0)
    const memoryUsage = (metrics.memory.used / (1024 * 1024)).toFixed(1)
    const cacheHitRate = (metrics.cache.hitRate * 100).toFixed(1)
    const activeStreams = metrics.streaming.activeStreams
    const errorRate = (metrics.streaming.errorRate * 100).toFixed(1)

    return `## 📊 Complete System Status

### 🏥 Overall Health: ${healthScore}/100
${healthScore >= 80 ? '🟢 Excellent' : healthScore >= 60 ? '🟡 Needs attention' : '🔴 Critical issues'}

### ⚡ Performance Metrics
• **Average Response Time:** ${avgResponseTime}ms
• **Memory Usage:** ${memoryUsage}MB (${(metrics.memory.percentage * 100).toFixed(1)}%)
• **Cache Hit Rate:** ${cacheHitRate}%
• **Active Streams:** ${activeStreams}

### 🌐 System Resources
• **Browser:** ${metrics.browser.name} ${metrics.browser.version}
• **Platform:** ${metrics.browser.isMobile ? 'Mobile' : 'Desktop'}
• **Active Tabs:** ${metrics.tabs.activeTabs}
• **Storage Used:** ${metrics.storage?.localStorageUsed || 0} bytes

### 🚨 Error Status
• **Streaming Error Rate:** ${errorRate}%
• **Storage Issues:** ${metrics.storage?.quotaExceeded ? 'Quota exceeded' : 'Normal'}
• **Memory Status:** ${metrics.memory.percentage > 0.8 ? 'High usage' : 'Normal'}

${this.getHealthInterpretation(healthScore)}`
  }

  private generateSpecificResponse(intents: string[], metrics: any): string {
    const responses: string[] = []

    if (intents.includes('performance')) {
      const avgTime = metrics.performance.averageResponseTime.toFixed(0)
      responses.push(`⚡ Performance: Average response time is ${avgTime}ms`)
    }

    if (intents.includes('memory')) {
      const memoryMB = (metrics.memory.used / (1024 * 1024)).toFixed(1)
      const percentage = (metrics.memory.percentage * 100).toFixed(1)
      responses.push(`🧠 Memory: Using ${memoryMB}MB (${percentage}%)`)
    }

    if (intents.includes('cache')) {
      const hitRate = (metrics.cache.hitRate * 100).toFixed(1)
      responses.push(`💾 Cache: ${hitRate}% hit rate, ${metrics.cache.entriesCount} entries`)
    }

    if (intents.includes('streaming')) {
      responses.push(`🌊 Streaming: ${metrics.streaming.activeStreams} active streams, ${(metrics.streaming.errorRate * 100).toFixed(1)}% error rate`)
    }

    if (intents.includes('storage')) {
      const storageUsed = metrics.storage?.localStorageUsed || 0
      responses.push(`💽 Storage: ${storageUsed} bytes used`)
    }

    if (intents.includes('browser')) {
      responses.push(`🌐 Browser: ${metrics.browser.name} ${metrics.browser.version} on ${metrics.browser.isMobile ? 'mobile' : 'desktop'}`)
    }

    if (intents.includes('errors')) {
      const errorRate = (metrics.streaming.errorRate * 100).toFixed(1)
      responses.push(`🚨 Errors: ${errorRate}% streaming error rate`)
    }

    return responses.join('\n')
  }

  private generateQuickRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    if (metrics.memory.percentage > 0.8) {
      recommendations.push('High memory usage - consider clearing cache')
    }

    if (metrics.cache.hitRate < 0.5) {
      recommendations.push('Low cache hit rate - review caching strategy')
    }

    if (metrics.streaming.activeStreams > 5) {
      recommendations.push('High stream load - monitor performance')
    }

    if (metrics.storage?.quotaExceeded) {
      recommendations.push('Storage quota exceeded - clear old data')
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operating normally')
    }

    return recommendations
  }

  private generateComprehensiveRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    // Memory recommendations
    if (metrics.memory.percentage > 0.9) {
      recommendations.push('🚨 CRITICAL: Memory usage extremely high - force garbage collection')
    } else if (metrics.memory.percentage > 0.8) {
      recommendations.push('⚠️ WARNING: High memory usage - monitor closely')
    }

    // Performance recommendations
    if (metrics.performance.averageResponseTime > 3000) {
      recommendations.push('🐌 Slow response times - investigate performance bottlenecks')
    }

    // Cache recommendations
    if (metrics.cache.hitRate < 0.5) {
      recommendations.push('📉 Low cache hit rate - optimize caching strategy')
    } else if (metrics.cache.hitRate > 0.9) {
      recommendations.push('✅ Excellent cache performance')
    }

    // Streaming recommendations
    if (metrics.streaming.errorRate > 0.1) {
      recommendations.push('🔄 High streaming error rate - check network connectivity')
    }

    if (metrics.streaming.activeStreams > 10) {
      recommendations.push('🌊 High stream concurrency - consider load balancing')
    }

    // Storage recommendations
    if (metrics.storage?.quotaExceeded) {
      recommendations.push('💾 Storage quota exceeded - implement data cleanup')
    }

    // Browser recommendations
    if (!browserFeatures.meetsMinimumRequirements()) {
      recommendations.push('🌐 Browser may not meet minimum requirements')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All systems operating optimally')
    }

    return recommendations
  }

  private generateTargetedRecommendations(intents: string[], metrics: any): string[] {
    const recommendations: string[] = []

    if (intents.includes('memory') && metrics.memory.percentage > 0.8) {
      recommendations.push('Clear browser cache and reload')
      recommendations.push('Close unused browser tabs')
    }

    if (intents.includes('performance') && metrics.performance.averageResponseTime > 2000) {
      recommendations.push('Check network connectivity')
      recommendations.push('Clear browser cache')
    }

    if (intents.includes('cache') && metrics.cache.hitRate < 0.7) {
      recommendations.push('Warm up frequently accessed data')
      recommendations.push('Review cache TTL settings')
    }

    if (intents.includes('streaming') && metrics.streaming.errorRate > 0.05) {
      recommendations.push('Check network stability')
      recommendations.push('Implement retry logic')
    }

    return recommendations.length > 0 ? recommendations : ['No specific recommendations needed']
  }

  private extractRelevantMetrics(intents: string[], metrics: any): any {
    const relevant: any = {}

    if (intents.includes('performance')) {
      relevant.performance = metrics.performance
    }

    if (intents.includes('memory')) {
      relevant.memory = metrics.memory
    }

    if (intents.includes('cache')) {
      relevant.cache = metrics.cache
    }

    if (intents.includes('streaming')) {
      relevant.streaming = metrics.streaming
    }

    if (intents.includes('storage')) {
      relevant.storage = metrics.storage
    }

    if (intents.includes('browser')) {
      relevant.browser = metrics.browser
    }

    return relevant
  }

  private calculateHealthScore(metrics: any): number {
    let score = 100

    // Memory usage penalty
    if (metrics.memory.percentage > 0.8) score -= 20

    // Performance penalty
    if (metrics.performance.averageResponseTime > 3000) score -= 15

    // Cache hit rate bonus/penalty
    if (metrics.cache.hitRate < 0.5) score -= 15
    else if (metrics.cache.hitRate > 0.8) score += 5

    // Streaming error penalty
    if (metrics.streaming.errorRate > 0.1) score -= 10

    // Storage quota penalty
    if (metrics.storage?.quotaExceeded) score -= 25

    return Math.max(0, Math.min(100, score))
  }

  private calculateSeverity(metrics: any): 'good' | 'warning' | 'critical' {
    const score = this.calculateHealthScore(metrics)
    if (score >= 80) return 'good'
    if (score >= 60) return 'warning'
    return 'critical'
  }

  private getHealthInterpretation(score: number): string {
    if (score >= 90) return "🎉 Excellent! System is performing optimally."
    if (score >= 80) return "✅ Good health. Everything is running smoothly."
    if (score >= 70) return "⚠️ Fair health. Minor issues detected, but nothing critical."
    if (score >= 60) return "🟡 Needs attention. Some systems are underperforming."
    if (score >= 40) return "🔴 Requires immediate attention. Multiple systems have issues."
    return "🚨 CRITICAL! System requires immediate intervention."
  }
}

// Export singleton instance
export const adminChatContext = new AdminChatContext()

