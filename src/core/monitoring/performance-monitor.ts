// 📊 PERFORMANCE MONITORING & MEMORY MANAGEMENT
// WHY: Prevents memory leaks, monitors performance, ensures smooth demos
// BUSINESS IMPACT: No slowdowns or crashes during client presentations

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface MemoryUsage {
  used: number
  total: number
  limit: number
  percentage: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 1000
  private readonly memoryThreshold = 0.8 // 80% memory usage
  private readonly performanceThreshold = 3000 // 3 seconds
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private performanceObserver: PerformanceObserver | null = null

  constructor() {
    this.initializePerformanceObserver()
    this.startMemoryMonitoring()
  }

  /**
   * Measure execution time of a function
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start

      this.recordMetric(name, duration, { ...metadata, success: true })
      this.checkPerformanceThreshold(name, duration)

      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(name, duration, { ...(metadata ?? {}), success: false, error: (error as any)?.message ?? String(error) })
      throw error
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = { name, value, timestamp: Date.now(), metadata: metadata ?? {} }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log significant issues
    if (value > this.performanceThreshold) {
      console.warn(`🚨 Performance issue: ${name} took ${value}ms`, metadata)
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryUsage {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const used = memory.usedJSHeapSize
      const total = memory.totalJSHeapSize
      const limit = memory.jsHeapSizeLimit

      return {
        used,
        total,
        limit,
        percentage: used / limit
      }
    }

    // Fallback for browsers without memory API
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0
    }
  }

  /**
   * Check if memory usage is too high
   */
  isMemoryUsageHigh(): boolean {
    const memory = this.getMemoryUsage()
    return memory.percentage > this.memoryThreshold
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if ('gc' in window) {
      (window as any).gc()
      console.log('🗑️ Forced garbage collection')
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageResponseTime: number
    slowestOperations: PerformanceMetric[]
    memoryUsage: MemoryUsage
    totalMetrics: number
  } {
    const responseTimeMetrics = this.metrics.filter(m => m.name.includes('response'))

    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      averageResponseTime,
      slowestOperations,
      memoryUsage: this.getMemoryUsage(),
      totalMetrics: this.metrics.length
    }
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime)
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      exportTime: new Date().toISOString()
    }, null, 2)
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }

    this.clearMetrics()
  }

  private initializePerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordMetric(
                entry.name,
                entry.duration,
                {
                  startTime: entry.startTime,
                  entryType: entry.entryType
                }
              )
            }
          }
        })

        this.performanceObserver.observe({ entryTypes: ['measure'] })
      } catch (error) {
        console.warn('Performance Observer not available:', error)
      }
    }
  }

  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(() => {
      const memory = this.getMemoryUsage()

      if (memory.percentage > this.memoryThreshold) {
        console.warn(`🚨 High memory usage: ${(memory.percentage * 100).toFixed(1)}%`)

        // Record memory metric
        this.recordMetric('memory-usage', memory.percentage, {
          used: memory.used,
          total: memory.total,
          limit: memory.limit
        })

        // Auto-cleanup if memory is critically high
        if (memory.percentage > 0.9) {
          this.forceGarbageCollection()
        }
      }
    }, 60000) // Check every minute
  }

  private checkPerformanceThreshold(operation: string, duration: number): void {
    if (duration > this.performanceThreshold) {
      console.warn(`🚨 Slow operation: ${operation} took ${duration}ms`)

      // Could trigger alerts or auto-remediation here
      if (duration > 10000) { // 10 seconds
        console.error(`🚨 CRITICAL: ${operation} took ${duration}ms - may indicate serious performance issue`)
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for common measurements
export const measureAsync = (name: string, fn: () => Promise<any>, metadata?: any) =>
  performanceMonitor.measureExecutionTime(name, fn, metadata)

export const measureSync = (name: string, fn: () => any, metadata?: any) => {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    performanceMonitor.recordMetric(name, duration, { ...metadata, success: true })
    return result
  } catch (error) {
    const duration = performance.now() - start
    performanceMonitor.recordMetric(name, duration, { ...(metadata ?? {}), success: false, error: (error as any)?.message ?? String(error) })
    throw error
  }
}

