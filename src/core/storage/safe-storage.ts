// 💾 SAFE LOCALSTORAGE MANAGEMENT
// WHY: Handles private browsing, quota limits, and provides fallbacks
// BUSINESS IMPACT: App works everywhere, no crashes in private mode

export interface StorageResult<T = string> {
  success: boolean
  data?: T
  error?: string
  fallbackUsed?: boolean
}

export class SafeStorage {
  private memoryStorage = new Map<string, string>()
  private quotaExceeded = false
  private readonly maxRetries = 3

  /**
   * Safely get data from localStorage with fallback to memory
   */
  get<T = string>(key: string): StorageResult<T> {
    try {
      if (this.quotaExceeded) {
        // Use memory fallback
        const data = this.memoryStorage.get(key)
        return {
          success: true,
          data: data as T,
          fallbackUsed: true
        }
      }

      const data = localStorage.getItem(key)
      if (data !== null) {
        // Validate JSON if it looks like JSON
        if (this.looksLikeJson(data)) {
          try {
            JSON.parse(data) // Validate
          } catch {
            return {
              success: false,
              error: 'Invalid JSON data in storage'
            }
          }
        }
      }

      return {
        success: true,
        data: data as T
      }
    } catch (error) {
      // Fallback to memory storage
      this.quotaExceeded = true
      const data = this.memoryStorage.get(key)

      return {
        success: true,
        data: data as T,
        fallbackUsed: true
      }
    }
  }

  /**
   * Safely set data to localStorage with fallback to memory
   */
  set<T = string>(key: string, value: T): StorageResult {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)

    try {
      if (this.quotaExceeded) {
        // Use memory fallback
        this.memoryStorage.set(key, stringValue)
        return {
          success: true,
          fallbackUsed: true
        }
      }

      localStorage.setItem(key, stringValue)
      this.quotaExceeded = false

      return {
        success: true
      }
    } catch (error) {
      // Fallback to memory storage
      this.quotaExceeded = true
      this.memoryStorage.set(key, stringValue)

      return {
        success: true,
        fallbackUsed: true
      }
    }
  }

  /**
   * Safely remove data from storage
   */
  remove(key: string): StorageResult {
    try {
      localStorage.removeItem(key)
      this.memoryStorage.delete(key)
      return { success: true }
    } catch (error) {
      this.memoryStorage.delete(key)
      return {
        success: true,
        fallbackUsed: true
      }
    }
  }

  /**
   * Safely clear all storage
   */
  clear(): StorageResult {
    try {
      localStorage.clear()
      this.memoryStorage.clear()
      this.quotaExceeded = false
      return { success: true }
    } catch (error) {
      this.memoryStorage.clear()
      return {
        success: true,
        fallbackUsed: true
      }
    }
  }

  /**
   * Get all keys (limited to avoid performance issues)
   */
  getAllKeys(): StorageResult<string[]> {
    try {
      if (this.quotaExceeded) {
        return {
          success: true,
          data: Array.from(this.memoryStorage.keys()),
          fallbackUsed: true
        }
      }

      const keys = []
      for (let i = 0; i < localStorage.length && i < 100; i++) {
        const key = localStorage.key(i)
        if (key) keys.push(key)
      }

      return {
        success: true,
        data: keys
      }
    } catch (error) {
      return {
        success: true,
        data: Array.from(this.memoryStorage.keys()),
        fallbackUsed: true
      }
    }
  }

  /**
   * Check if storage is available and working
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage usage information
   */
  getUsageInfo(): StorageResult<{
    localStorageUsed: number
    memoryStorageUsed: number
    quotaExceeded: boolean
    usingFallback: boolean
  }> {
    try {
      const localStorageUsed = this.calculateLocalStorageUsage()

      return {
        success: true,
        data: {
          localStorageUsed,
          memoryStorageUsed: this.memoryStorage.size,
          quotaExceeded: this.quotaExceeded,
          usingFallback: this.quotaExceeded
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Could not calculate storage usage',
        data: {
          localStorageUsed: 0,
          memoryStorageUsed: this.memoryStorage.size,
          quotaExceeded: true,
          usingFallback: true
        }
      }
    }
  }

  /**
   * Clean up old/invalid data
   */
  cleanup(): StorageResult {
    try {
      const keys = this.getAllKeys()
      if (!keys.success || !keys.data) return { success: false }

      let cleanedCount = 0
      const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago

      for (const key of keys.data) {
        if (key.startsWith('temp_') || key.startsWith('cache_')) {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsed = JSON.parse(data)
              if (parsed.timestamp && parsed.timestamp < cutoff) {
                localStorage.removeItem(key)
                cleanedCount++
              }
            }
          } catch {
            // Skip invalid entries
          }
        }
      }

      return {
        success: true,
        data: JSON.stringify({ cleanedCount })
      }
    } catch (error) {
      return {
        success: false,
        error: 'Cleanup failed'
      }
    }
  }

  private looksLikeJson(str: string): boolean {
    return (str.startsWith('{') && str.endsWith('}')) ||
           (str.startsWith('[') && str.endsWith(']'))
  }

  private calculateLocalStorageUsage(): number {
    let total = 0
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            total += key.length + value.length
          }
        }
      }
    } catch {
      // If we can't calculate, return 0
      total = 0
    }
    return total
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage()

// Utility functions for common use cases
export const safeSessionStorage = {
  get: (key: string) => safeStorage.get(key),
  set: (key: string, value: any) => safeStorage.set(key, value),
  remove: (key: string) => safeStorage.remove(key),
  clear: () => safeStorage.clear()
}

