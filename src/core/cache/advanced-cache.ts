// 🧠 ADVANCED CACHING STRATEGIES
// WHY: Intelligent caching reduces API calls, improves performance, saves costs
// BUSINESS IMPACT: Faster responses, lower API costs, better user experience

import { safeStorage } from '../storage/safe-storage'
import { performanceMonitor } from '../monitoring/performance-monitor'

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  lastAccessed: number
  tags: string[]
  dependencies: string[]
  compression?: boolean
  size: number
}

export interface CacheConfig {
  defaultTTL: number
  maxMemoryUsage: number // MB
  compressionThreshold: number // bytes
  enableLRU: boolean
  enableCompression: boolean
  backgroundRefresh: boolean
  cacheLayers: ('memory' | 'localStorage' | 'indexedDB')[]
}

export type CacheStrategy = 'LRU' | 'LFU' | 'TTL' | 'SIZE' | 'HYBRID'

export class AdvancedCache {
  private memoryCache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    compressionSavings: 0
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxMemoryUsage: 50, // 50MB
      compressionThreshold: 1024, // 1KB
      enableLRU: true,
      enableCompression: true,
      backgroundRefresh: true,
      cacheLayers: ['memory', 'localStorage'],
      ...config
    }

    this.initializeCache()
    this.startMaintenance()
  }

  /**
   * Intelligent caching with multiple strategies
   */
  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    options: {
      ttl?: number
      strategy?: CacheStrategy
      tags?: string[]
      dependencies?: string[]
      force?: boolean
    } = {}
  ): Promise<T | null> {
    const {
      ttl = this.config.defaultTTL,
      strategy = 'HYBRID',
      tags = [],
      dependencies = [],
      force = false
    } = options

    // Check if cache entry exists and is valid
    const existing = this.memoryCache.get(key)

    if (!force && existing && this.isValid(existing, strategy)) {
      existing.hits++
      existing.lastAccessed = Date.now()
      this.cacheStats.hits++

      // Update access patterns
      await this.updateAccessPatterns(key, existing)

      return existing.data
    }

    // Cache miss or expired
    this.cacheStats.misses++

    // If no fetcher provided, return null
    if (!fetcher) return null

    // Background refresh if enabled and entry exists but expired
    if (existing && !force && this.config.backgroundRefresh) {
      this.backgroundRefresh(key, fetcher, ttl, tags, dependencies)
      return existing.data // Return stale data while refreshing
    }

    try {
      // Fetch fresh data
      const data = await fetcher()
      await this.set(key, data, { ttl, tags, dependencies })
      return data
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set cache entry with intelligent storage
   */
  async set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number
      tags?: string[]
      dependencies?: string[]
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ): Promise<void> {
    const {
      ttl = this.config.defaultTTL,
      tags = [],
      dependencies = [],
      priority = 'normal'
    } = options

    const size = this.calculateSize(data)
    const shouldCompress = size > this.config.compressionThreshold && this.config.enableCompression

    const entry: CacheEntry<T> = {
      data: shouldCompress ? await this.compress(data) : data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
      tags,
      dependencies,
      compression: shouldCompress,
      size
    }

    // Store in memory
    this.memoryCache.set(key, entry)
    this.cacheStats.size += size

    // Evict if necessary
    await this.evictIfNecessary()

    // Persist to additional layers
    await this.persistToLayers(key, entry)

    // Update cache statistics
    performanceMonitor.recordMetric('cache-set', size, {
      key,
      ttl,
      compressed: shouldCompress,
      tags: tags.length
    })
  }

  /**
   * Invalidate cache entries by tags or patterns
   */
  async invalidate(pattern: string | string[], strategy: 'exact' | 'prefix' | 'tags' = 'exact'): Promise<number> {
    let invalidated = 0
    const patterns = Array.isArray(pattern) ? pattern : [pattern]

    for (const [key, entry] of this.memoryCache.entries()) {
      let shouldInvalidate = false

      switch (strategy) {
        case 'exact':
          shouldInvalidate = patterns.includes(key)
          break
        case 'prefix':
          shouldInvalidate = patterns.some(p => key.startsWith(p))
          break
        case 'tags':
          shouldInvalidate = patterns.some(p => entry.tags.includes(p))
          break
      }

      if (shouldInvalidate) {
        await this.remove(key)
        invalidated++
      }
    }

    return invalidated
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void> {
    const warmupPromises = keys.map(async (key) => {
      try {
        const data = await fetcher(key)
        await this.set(key, data, {
          tags: ['warmup'],
          priority: 'low'
        })
      } catch (error) {
        console.warn(`Cache warmup failed for ${key}:`, error)
      }
    })

    await Promise.allSettled(warmupPromises)
  }

  /**
   * Get cache performance metrics
   */
  getCacheMetrics(): {
    hitRate: number
    totalRequests: number
    memoryUsage: number
    entriesCount: number
    averageEntrySize: number
    compressionRatio: number
    evictionRate: number
  } {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses
    const hitRate = totalRequests > 0 ? this.cacheStats.hits / totalRequests : 0

    const entries = Array.from(this.memoryCache.values())
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    const averageSize = entries.length > 0 ? totalSize / entries.length : 0

    const compressedEntries = entries.filter(e => e.compression)
    const originalSize = compressedEntries.reduce((sum, entry) => sum + entry.size, 0)
    const compressionRatio = originalSize > 0 ? this.cacheStats.compressionSavings / originalSize : 0

    return {
      hitRate,
      totalRequests,
      memoryUsage: this.cacheStats.size / (1024 * 1024), // MB
      entriesCount: this.memoryCache.size,
      averageEntrySize: averageSize,
      compressionRatio,
      evictionRate: totalRequests > 0 ? this.cacheStats.evictions / totalRequests : 0
    }
  }

  /**
   * Predictive caching based on usage patterns
   */
  async enablePredictiveCaching(
    predictor: (recentKeys: string[]) => Promise<string[]>
  ): Promise<void> {
    setInterval(async () => {
      try {
        const recentKeys = Array.from(this.memoryCache.entries())
          .filter(([_, entry]) => Date.now() - entry.lastAccessed < 300000) // Last 5 minutes
          .sort(([, a], [, b]) => b.lastAccessed - a.lastAccessed)
          .slice(0, 10)
          .map(([key]) => key)

        const predictedKeys = await predictor(recentKeys)

        // Pre-fetch predicted keys if not in cache
        for (const key of predictedKeys) {
          if (!this.memoryCache.has(key)) {
            // This would typically call a fetcher function
            // For now, just mark as predicted
            console.log(`Predicted cache key: ${key}`)
          }
        }
      } catch (error) {
        console.warn('Predictive caching error:', error)
      }
    }, 60000) // Every minute
  }

  private async initializeCache(): Promise<void> {
    // Load persisted cache entries
    if (this.config.cacheLayers.includes('localStorage')) {
      await this.loadFromLocalStorage()
    }

    if (this.config.cacheLayers.includes('indexedDB')) {
      await this.loadFromIndexedDB()
    }
  }

  private async loadFromLocalStorage(): Promise<void> {
    const cacheData = safeStorage.get('cache_entries')
    if (!cacheData.success || !cacheData.data) return

    try {
      const entries = JSON.parse(cacheData.data)
      for (const [key, entry] of Object.entries(entries)) {
        if (this.isValid(entry as CacheEntry)) {
          this.memoryCache.set(key, entry as CacheEntry)
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    // IndexedDB implementation would go here
    // For now, this is a placeholder
  }

  private async persistToLayers(key: string, entry: CacheEntry): Promise<void> {
    if (this.config.cacheLayers.includes('localStorage')) {
      const cacheData = safeStorage.get('cache_entries')
      const entries = cacheData.success && cacheData.data
        ? JSON.parse(cacheData.data)
        : {}

      entries[key] = entry
      safeStorage.set('cache_entries', JSON.stringify(entries))
    }
  }

  private async remove(key: string): Promise<void> {
    const entry = this.memoryCache.get(key)
    if (entry) {
      this.cacheStats.size -= entry.size
      this.memoryCache.delete(key)

      // Remove from persistent layers
      await this.removeFromLayers(key)
    }
  }

  private async removeFromLayers(key: string): Promise<void> {
    if (this.config.cacheLayers.includes('localStorage')) {
      const cacheData = safeStorage.get('cache_entries')
      if (cacheData.success && cacheData.data) {
        const entries = JSON.parse(cacheData.data)
        delete entries[key]
        safeStorage.set('cache_entries', JSON.stringify(entries))
      }
    }
  }

  private async evictIfNecessary(): Promise<void> {
    const maxBytes = this.config.maxMemoryUsage * 1024 * 1024

    while (this.cacheStats.size > maxBytes && this.memoryCache.size > 0) {
      const keyToEvict = this.selectEvictionCandidate()
      if (keyToEvict) {
        await this.remove(keyToEvict)
        this.cacheStats.evictions++
      } else {
        break
      }
    }
  }

  private selectEvictionCandidate(): string | null {
    if (!this.config.enableLRU) {
      // Simple FIFO eviction
      return this.memoryCache.keys().next().value || null
    }

    // LRU eviction
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    return oldestKey
  }

  private isValid(entry: CacheEntry, strategy: CacheStrategy = 'HYBRID'): boolean {
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      return false
    }

    // Strategy-specific validation
    switch (strategy) {
      case 'LRU':
        return Date.now() - entry.lastAccessed < entry.ttl
      case 'LFU':
        return entry.hits > 0 // Keep if accessed at least once
      case 'TTL':
        return true // Only TTL matters
      case 'HYBRID':
        return entry.hits > 0 && Date.now() - entry.lastAccessed < entry.ttl * 2
      default:
        return true
    }
  }

  private calculateSize(data: any): number {
    return new TextEncoder().encode(JSON.stringify(data)).length
  }

  private async compress(data: any): Promise<any> {
    // Simple compression - in production, use proper compression
    const jsonString = JSON.stringify(data)
    const compressed = jsonString.replace(/\s+/g, ' ').trim()
    this.cacheStats.compressionSavings += jsonString.length - compressed.length
    return compressed
  }

  private async updateAccessPatterns(key: string, entry: CacheEntry): Promise<void> {
    // Update access patterns for predictive caching
    const patterns = safeStorage.get('access_patterns')
    const patternsData = patterns.success && patterns.data
      ? JSON.parse(patterns.data)
      : { sequences: [], frequencies: {} }

    // Update frequency
    patternsData.frequencies[key] = (patternsData.frequencies[key] || 0) + 1

    safeStorage.set('access_patterns', JSON.stringify(patternsData))
  }

  private async backgroundRefresh(
    key: string,
    fetcher: () => Promise<any>,
    ttl: number,
    tags: string[],
    dependencies: string[]
  ): Promise<void> {
    try {
      const freshData = await fetcher()
      await this.set(key, freshData, { ttl, tags, dependencies })
    } catch (error) {
      console.warn(`Background refresh failed for ${key}:`, error)
    }
  }

  private startMaintenance(): void {
    // Periodic cleanup
    setInterval(async () => {
      await this.cleanup()
    }, 300000) // 5 minutes

    // Periodic metrics update
    setInterval(() => {
      const metrics = this.getCacheMetrics()
      performanceMonitor.recordMetric('cache-metrics', metrics.hitRate * 100, {
        memoryUsage: metrics.memoryUsage,
        entriesCount: metrics.entriesCount,
        evictionRate: metrics.evictionRate
      })
    }, 60000) // 1 minute
  }

  private async cleanup(): Promise<void> {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      await this.remove(key)
    }

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`)
    }
  }
}

// Export singleton instance
export const advancedCache = new AdvancedCache()

