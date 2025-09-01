import { type SystemMetrics } from '../SystemHealthDashboard'

// Helper Functions
export function getHealthScore(metrics: SystemMetrics): number {
  let score = 100

  // Memory usage penalty
  if (metrics.memory.percentage > 0.8) score -= 20

  // Cache hit rate bonus/penalty
  if (metrics.cache.hitRate < 0.5) score -= 15
  else if (metrics.cache.hitRate > 0.8) score += 5

  // Streaming error penalty
  if (metrics.streaming.errorRate > 0.1) score -= 10

  // Storage quota penalty
  if (metrics.storage?.quotaExceeded) score -= 25

  return Math.max(0, Math.min(100, score))
}

export function getHealthStatus(metrics: SystemMetrics): 'good' | 'warning' | 'error' {
  const score = getHealthScore(metrics)

  if (score >= 80) return 'good'
  if (score >= 60) return 'warning'
  return 'error'
}

export function getStatusBadgeVariant(status: 'good' | 'warning' | 'error') {
  switch (status) {
    case 'good':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function getStatusIcon(status: 'good' | 'warning' | 'error') {
  switch (status) {
    case 'good':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return '❓'
  }
}
