interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  version?: string
}

interface CacheOptions {
  ttl?: number
  namespace?: string
  version?: string
}

export class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>()
  private namespaces = new Map<string, Set<string>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startCleanup()
  }

  set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): void {
    const { ttl = 3600000, namespace = 'default', version } = options
    const fullKey = this.getFullKey(key, namespace)
    
    this.cache.set(fullKey, {
      data,
      timestamp: Date.now(),
      ttl,
      version
    })

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new Set())
    }
    this.namespaces.get(namespace)!.add(fullKey)
  }

  get<T>(
    key: string,
    namespace: string = 'default'
  ): T | null {
    const fullKey = this.getFullKey(key, namespace)
    const entry = this.cache.get(fullKey)
    
    if (!entry) return null
    
    if (this.isExpired(entry)) {
      this.delete(key, namespace)
      return null
    }
    
    return entry.data as T
  }

  delete(key: string, namespace: string = 'default'): boolean {
    const fullKey = this.getFullKey(key, namespace)
    const deleted = this.cache.delete(fullKey)
    
    const nsKeys = this.namespaces.get(namespace)
    if (nsKeys) {
      nsKeys.delete(fullKey)
    }
    
    return deleted
  }

  clear(namespace?: string): void {
    if (namespace) {
      const nsKeys = this.namespaces.get(namespace)
      if (nsKeys) {
        nsKeys.forEach(key => this.cache.delete(key))
        this.namespaces.delete(namespace)
      }
    } else {
      this.cache.clear()
      this.namespaces.clear()
    }
  }

  private getFullKey(key: string, namespace: string): string {
    return `${namespace}:${key}`
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        
        for (const [namespace, keys] of this.namespaces.entries()) {
          keys.delete(key)
        }
      }
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

export const advancedCache = new AdvancedCache()