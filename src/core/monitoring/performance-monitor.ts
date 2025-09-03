export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: Date
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private timers = new Map<string, number>()
  private maxMetrics = 1000

  startTimer(operation: string): void {
    this.timers.set(operation, performance.now())
  }

  endTimer(
    operation: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): number {
    const startTime = this.timers.get(operation)
    if (!startTime) {
      console.warn(`No timer found for operation: ${operation}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(operation)

    this.recordMetric({
      operation,
      duration,
      timestamp: new Date(),
      success,
      metadata
    })

    return duration
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation)
    }
    return [...this.metrics]
  }

  getAverageTime(operation: string): number {
    const operationMetrics = this.getMetrics(operation)
    if (operationMetrics.length === 0) return 0

    const totalTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalTime / operationMetrics.length
  }

  getSuccessRate(operation: string): number {
    const operationMetrics = this.getMetrics(operation)
    if (operationMetrics.length === 0) return 0

    const successCount = operationMetrics.filter(m => m.success).length
    return (successCount / operationMetrics.length) * 100
  }

  getRecentMetrics(minutes: number = 5): PerformanceMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000)
    return this.metrics.filter(m => m.timestamp.getTime() > cutoffTime)
  }

  getSummary(): {
    totalOperations: number
    averageTime: number
    successRate: number
    recentErrors: string[]
  } {
    const totalOperations = this.metrics.length
    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    const averageTime = totalOperations > 0 ? totalTime / totalOperations : 0
    const successCount = this.metrics.filter(m => m.success).length
    const successRate = totalOperations > 0 ? (successCount / totalOperations) * 100 : 0
    
    const recentErrors = this.getRecentMetrics()
      .filter(m => !m.success && m.error)
      .map(m => m.error!)
      .slice(-5)

    return {
      totalOperations,
      averageTime,
      successRate,
      recentErrors
    }
  }

  clear(): void {
    this.metrics = []
    this.timers.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()