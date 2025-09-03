import { performanceMonitor } from '../monitoring/performance-monitor'
import { tokenUsageLogger } from '../token-usage-logger'
import { advancedCache } from '../cache/advanced-cache'

export interface AdminContext {
  system: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    performance: {
      averageResponseTime: number
      successRate: number
      recentErrors: string[]
    }
  }
  usage: {
    tokens: {
      today: number
      week: number
      month: number
      cost: number
    }
    users: {
      active: number
      total: number
    }
  }
  cache: {
    entries: number
    hitRate: number
  }
  features: {
    enabled: string[]
    disabled: string[]
  }
}

export class AdminContextBuilder {
  private startTime = Date.now()

  async buildContext(): Promise<AdminContext> {
    const performance = performanceMonitor.getSummary()
    const tokenUsage = tokenUsageLogger.getUsageSummary(30)
    
    // Calculate uptime
    const uptime = Date.now() - this.startTime

    // Get memory usage (if available in browser)
    const memory = this.getMemoryUsage()

    // Build admin context
    const context: AdminContext = {
      system: {
        uptime,
        memory,
        performance: {
          averageResponseTime: performance.averageTime,
          successRate: performance.successRate,
          recentErrors: performance.recentErrors
        }
      },
      usage: {
        tokens: {
          today: tokenUsageLogger.getTodayUsage(),
          week: tokenUsage.totalTokens,
          month: tokenUsage.totalTokens,
          cost: tokenUsage.totalCost
        },
        users: {
          active: this.getActiveUsers(),
          total: this.getTotalUsers()
        }
      },
      cache: {
        entries: this.getCacheEntries(),
        hitRate: this.getCacheHitRate()
      },
      features: {
        enabled: this.getEnabledFeatures(),
        disabled: this.getDisabledFeatures()
      }
    }

    return context
  }

  private getMemoryUsage(): AdminContext['system']['memory'] {
    // Check if memory API is available
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }

    // Fallback for environments without memory API
    return {
      used: 0,
      total: 0,
      percentage: 0
    }
  }

  private getActiveUsers(): number {
    // This would typically query your database
    // For now, return a mock value
    return 10
  }

  private getTotalUsers(): number {
    // This would typically query your database
    return 100
  }

  private getCacheEntries(): number {
    // This would query the actual cache
    return 50
  }

  private getCacheHitRate(): number {
    // Calculate based on cache hits vs misses
    return 85 // 85% hit rate
  }

  private getEnabledFeatures(): string[] {
    return [
      'chat',
      'multimodal',
      'realtime',
      'translation',
      'workshop'
    ]
  }

  private getDisabledFeatures(): string[] {
    return [
      'video-processing',
      'advanced-analytics'
    ]
  }

  generateReport(): string {
    const context = this.buildContext()
    
    return `
Admin System Report
==================

System Status:
- Uptime: ${Math.floor(context.system.uptime / 1000 / 60)} minutes
- Memory: ${context.system.memory.percentage.toFixed(1)}% used
- Avg Response Time: ${context.system.performance.averageResponseTime.toFixed(2)}ms
- Success Rate: ${context.system.performance.successRate.toFixed(1)}%

Token Usage:
- Today: ${context.usage.tokens.today} tokens
- This Week: ${context.usage.tokens.week} tokens
- Estimated Cost: $${context.usage.tokens.cost.toFixed(2)}

User Activity:
- Active Users: ${context.usage.users.active}
- Total Users: ${context.usage.users.total}

Cache Performance:
- Entries: ${context.cache.entries}
- Hit Rate: ${context.cache.hitRate}%

Features:
- Enabled: ${context.features.enabled.join(', ')}
- Disabled: ${context.features.disabled.join(', ')}
    `.trim()
  }
}

export const adminContextBuilder = new AdminContextBuilder()