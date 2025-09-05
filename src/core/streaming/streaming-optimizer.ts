// 🚀 REAL-TIME STREAMING OPTIMIZATIONS
// WHY: Maximizes streaming performance, prevents bottlenecks, ensures smooth AI conversations
// BUSINESS IMPACT: Lightning-fast AI responses, no lag, professional user experience

import { performanceMonitor } from '../monitoring/performance-monitor'
import { tabSync } from '../state/tab-sync'
import { safeStorage } from '../storage/safe-storage'

export interface StreamingConfig {
  maxConcurrentStreams: number
  chunkSize: number
  retryAttempts: number
  timeoutMs: number
  enableCompression: boolean
  enableDeduplication: boolean
  adaptiveBuffering: boolean
}

export interface StreamMetrics {
  streamId: string
  startTime: number
  endTime?: number
  bytesReceived: number
  chunksReceived: number
  retryCount: number
  averageChunkSize: number
  compressionRatio?: number
}

export class StreamingOptimizer {
  private activeStreams = new Map<string, ReadableStreamDefaultController>()
  private streamMetrics = new Map<string, StreamMetrics>()
  private connectionPool = new Map<string, WebSocket[]>()
  private deduplicationCache = new Map<string, string>()
  private config: StreamingConfig

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = {
      maxConcurrentStreams: 5,
      chunkSize: 4096,
      retryAttempts: 3,
      timeoutMs: 30000,
      enableCompression: true,
      enableDeduplication: true,
      adaptiveBuffering: true,
      ...config
    }

    this.startMetricsCollection()
    this.initializeConnectionPooling()
  }

  /**
   * Create optimized streaming response
   */
  async createOptimizedStream(
    streamGenerator: () => AsyncIterable<any>,
    streamId: string,
    options: {
      compress?: boolean
      deduplicate?: boolean
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ): Promise<ReadableStream> {
    const startTime = performance.now()

    // Check concurrent stream limits
    if (this.activeStreams.size >= this.config.maxConcurrentStreams) {
      throw new Error('Maximum concurrent streams reached')
    }

    // Initialize metrics
    this.streamMetrics.set(streamId, {
      streamId,
      startTime,
      bytesReceived: 0,
      chunksReceived: 0,
      retryCount: 0,
      averageChunkSize: 0
    })

    return new ReadableStream({
      start: async (controller) => {
        this.activeStreams.set(streamId, controller)

        try {
          const generator = streamGenerator()
          let chunkCount = 0
          let totalBytes = 0

          for await (const chunk of generator) {
            // Check if stream was cancelled
            if (!this.activeStreams.has(streamId)) {
              break
            }

            // Deduplication
            if (options.deduplicate && this.config.enableDeduplication) {
              const chunkHash = this.hashChunk(chunk)
              if (this.deduplicationCache.has(chunkHash)) {
                continue // Skip duplicate chunk
              }
              this.deduplicationCache.set(chunkHash, chunk)
            }

            // Compression
            let processedChunk = chunk
            if (options.compress && this.config.enableCompression) {
              processedChunk = await this.compressChunk(chunk)
            }

            // Convert to Uint8Array for efficient streaming
            const chunkData = this.chunkToUint8Array(processedChunk)
            totalBytes += chunkData.length
            chunkCount++

            // Send chunk
            controller.enqueue(chunkData)

            // Yield control to prevent blocking
            await new Promise(resolve => setImmediate ? setImmediate(resolve) : setTimeout(resolve, 0))
          }

          // Update metrics
          const metrics = this.streamMetrics.get(streamId)
          if (metrics) {
            metrics.endTime = performance.now()
            metrics.bytesReceived = totalBytes
            metrics.chunksReceived = chunkCount
            metrics.averageChunkSize = totalBytes / chunkCount
          }

          controller.close()

        } catch (error) {
          console.error(`Streaming error for ${streamId}:`, error)

          // Send error chunk
          const errorChunk = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Streaming error',
            streamId,
            timestamp: Date.now()
          }

          controller.enqueue(this.chunkToUint8Array(errorChunk))
          controller.close()
        } finally {
          this.activeStreams.delete(streamId)
          this.cleanupStreamResources(streamId)
        }
      },

      cancel: (reason) => {
        console.log(`Stream ${streamId} cancelled:`, reason)
        this.activeStreams.delete(streamId)
        this.cleanupStreamResources(streamId)
      }
    })
  }

  /**
   * Adaptive streaming with intelligent backoff
   */
  async createAdaptiveStream(
    endpoint: string,
    options: {
      initialDelay?: number
      maxDelay?: number
      backoffFactor?: number
      maxRetries?: number
    } = {}
  ): Promise<WebSocket> {
    const {
      initialDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      maxRetries = 5
    } = options

    let attempt = 0
    let delay = initialDelay

    while (attempt < maxRetries) {
      try {
        const connection = await this.createWebSocketConnection(endpoint)

        // Connection successful
        this.addToConnectionPool(endpoint, connection)
        return connection

      } catch (error) {
        attempt++

        if (attempt >= maxRetries) {
          throw new Error(`Failed to establish connection after ${maxRetries} attempts`)
        }

        console.warn(`Connection attempt ${attempt} failed, retrying in ${delay}ms`)

        // Exponential backoff with jitter
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000))

        delay = Math.min(delay * backoffFactor, maxDelay)
      }
    }

    throw new Error('Connection failed')
  }

  /**
   * Stream multiplexing for multiple concurrent streams
   */
  createMultiplexedStream(
    streams: ReadableStream[],
    options: {
      priority?: ('high' | 'normal' | 'low')[]
      maxConcurrency?: number
    } = {}
  ): ReadableStream {
    const { priority = [], maxConcurrency = 3 } = options

    return new ReadableStream({
      start: async (controller) => {
        const streamControllers = streams.map((stream, index) =>
          stream.getReader()
        )

        const activeStreams = new Set<number>()
        const streamPriorities = priority.length > 0 ? priority : streams.map(() => 'normal')

        // Priority queue processing
        const processStreams = async () => {
          while (activeStreams.size < maxConcurrency && streamControllers.length > 0) {
            // Find highest priority available stream
            const availableStreams = streamControllers
              .map((_, index) => index)
              .filter(index => !activeStreams.has(index))

            if (availableStreams.length === 0) break

            // Sort by priority
            availableStreams.sort((a, b) => {
              const priorityA = this.getPriorityWeight(
                (streamPriorities[a] ?? 'normal') as 'low' | 'normal' | 'high'
              )
              const priorityB = this.getPriorityWeight(
                (streamPriorities[b] ?? 'normal') as 'low' | 'normal' | 'high'
              )
              return priorityB - priorityA // Higher priority first
            })

            const nextStreamIndex = availableStreams[0]

            if (typeof nextStreamIndex === 'number') {
              activeStreams.add(nextStreamIndex)
              const controller = streamControllers[nextStreamIndex]
              if (controller) {
                this.processStreamChunk(
                  controller as unknown as ReadableStreamDefaultController,
                  nextStreamIndex,
                  activeStreams
                )
              }
            }
          }
        }

        await processStreams()
      }
    })
  }

  /**
   * Intelligent caching for streaming responses
   */
  async createCachedStream(
    cacheKey: string,
    streamGenerator: () => AsyncIterable<any>,
    ttlMs: number = 300000 // 5 minutes
  ): Promise<ReadableStream> {
    // Check cache first
    const cached = await this.getCachedStream(cacheKey)
    if (cached && !this.isCacheExpired(cached.timestamp, ttlMs)) {
      return cached.stream
    }

    // Generate new stream
    const newStream = await this.createOptimizedStream(streamGenerator, cacheKey)

    // Cache the stream
    await this.cacheStream(cacheKey, newStream)

    return newStream
  }

  /**
   * Stream health monitoring
   */
  getStreamHealth(): {
    activeStreams: number
    totalStreamsProcessed: number
    averageStreamDuration: number
    errorRate: number
    throughputMbps: number
  } {
    const metrics = Array.from(this.streamMetrics.values())
    const completedStreams = metrics.filter(m => m.endTime)

    const totalDuration = completedStreams.reduce((sum, m) => {
      return sum + (m.endTime! - m.startTime)
    }, 0)

    const totalBytes = metrics.reduce((sum, m) => sum + m.bytesReceived, 0)
    const totalTime = Math.max(1, Date.now() - Math.min(...metrics.map(m => m.startTime)))

    return {
      activeStreams: this.activeStreams.size,
      totalStreamsProcessed: completedStreams.length,
      averageStreamDuration: completedStreams.length > 0 ? totalDuration / completedStreams.length : 0,
      errorRate: metrics.filter(m => m.retryCount > 0).length / Math.max(1, metrics.length),
      throughputMbps: (totalBytes * 8) / (totalTime * 1000 * 1000) // Mbps
    }
  }

  private async createWebSocketConnection(endpoint: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(endpoint)

      ws.onopen = () => resolve(ws)
      ws.onerror = () => reject(new Error('WebSocket connection failed'))
      ws.onclose = () => reject(new Error('WebSocket connection closed'))

      // Timeout
      setTimeout(() => {
        reject(new Error('WebSocket connection timeout'))
      }, this.config.timeoutMs)
    })
  }

  private addToConnectionPool(endpoint: string, connection: WebSocket): void {
    if (!this.connectionPool.has(endpoint)) {
      this.connectionPool.set(endpoint, [])
    }

    const pool = this.connectionPool.get(endpoint)!
    pool.push(connection)

    // Clean up closed connections
    connection.onclose = () => {
      const index = pool.indexOf(connection)
      if (index > -1) {
        pool.splice(index, 1)
      }
    }
  }

  private async compressChunk(chunk: unknown): Promise<unknown> {
    // Simple compression - in production, use a proper compression library
    if (typeof chunk === 'string') {
      // Basic string compression (remove whitespace, etc.)
      return chunk.replace(/\s+/g, ' ').trim()
    }
    return chunk
  }

  private hashChunk(chunk: unknown): string {
    // Simple hash for deduplication
    const str = JSON.stringify(chunk)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  private chunkToUint8Array(chunk: unknown): Uint8Array {
    const jsonString = JSON.stringify(chunk)
    return new TextEncoder().encode(jsonString)
  }

  private getPriorityWeight(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high': return 3
      case 'normal': return 2
      case 'low': return 1
      default: return 2
    }
  }

  private async processStreamChunk(
    controllerOrReader: ReadableStreamDefaultController | ReadableStreamDefaultReader,
    streamIndex: number,
    activeStreams: Set<number>
  ): Promise<void> {
    try {
      // Handle controller case (enqueue directly)
      if (typeof (controllerOrReader as ReadableStreamDefaultController).enqueue === 'function') {
        const controller = controllerOrReader as ReadableStreamDefaultController;
        // In controller mode, we don't read from a stream, we just manage the stream lifecycle
        return;
      }

      // Handle reader case (read and process)
      const reader = controllerOrReader as ReadableStreamDefaultReader;
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Find the controller for this stream index to enqueue
        const controller = Array.from(this.streamControllers.entries())
          .find(([_, ctrl]) => ctrl === controllerOrReader)?.[1] as ReadableStreamDefaultController;

        if (controller) {
          controller.enqueue(value)
        }
      }
    } finally {
      activeStreams.delete(streamIndex)
    }
  }

  private async getCachedStream(cacheKey: string): Promise<{ stream: ReadableStream; timestamp: number } | null> {
    const cacheData = safeStorage.get(`stream_cache_${cacheKey}`)
    if (!cacheData.success || !cacheData.data) return null

    try {
      const parsed = JSON.parse(cacheData.data)
      return parsed
    } catch {
      return null
    }
  }

  private async cacheStream(cacheKey: string, stream: ReadableStream): Promise<void> {
    const cacheData = {
      stream, // Note: This is simplified - real implementation would serialize
      timestamp: Date.now()
    }

    safeStorage.set(`stream_cache_${cacheKey}`, JSON.stringify(cacheData))
  }

  private isCacheExpired(timestamp: number, ttlMs: number): boolean {
    return Date.now() - timestamp > ttlMs
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      const health = this.getStreamHealth()
      performanceMonitor.recordMetric('streaming-health', health.throughputMbps, {
        activeStreams: health.activeStreams,
        errorRate: health.errorRate,
        averageDuration: health.averageStreamDuration
      })
    }, 30000) // Every 30 seconds
  }

  private initializeConnectionPooling(): void {
    // Pre-warm connections for common endpoints
    const commonEndpoints = [
      'wss://api.gemini.ai/stream',
      'wss://api.openai.com/stream'
    ]

    commonEndpoints.forEach(endpoint => {
      this.createAdaptiveStream(endpoint).catch(() => {
        // Ignore pre-warm failures
      })
    })
  }

  private cleanupStreamResources(streamId: string): void {
    // Clean up deduplication cache for old entries
    const cutoff = Date.now() - 300000 // 5 minutes
    for (const [hash, chunk] of this.deduplicationCache.entries()) {
      try {
        const parsed = JSON.parse(chunk)
        if (parsed.timestamp && parsed.timestamp < cutoff) {
          this.deduplicationCache.delete(hash)
        }
      } catch {
        // Remove invalid entries
        this.deduplicationCache.delete(hash)
      }
    }
  }
}

// Export singleton instance
export const streamingOptimizer = new StreamingOptimizer()

