// 🔄 CROSS-TAB SYNCHRONIZATION
// WHY: Keeps multiple browser tabs in sync for seamless user experience
// BUSINESS IMPACT: No confusion when users have multiple tabs open

import { safeStorage } from '../storage/safe-storage'

export interface TabSyncMessage {
  type: 'state_update' | 'session_change' | 'activity_update' | 'ping' | 'pong'
  key: string
  data: any
  timestamp: number
  sourceTab: string
}

export class TabSync {
  private channel: BroadcastChannel | null = null
  private listeners = new Map<string, ((data: any) => void)[]>()
  private tabId: string
  private heartbeatInterval: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private readonly HEARTBEAT_INTERVAL = 30000 // 30 seconds
  private readonly CLEANUP_INTERVAL = 60000 // 1 minute
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(private channelName: string = 'fbc-chat-sync') {
    this.tabId = this.generateTabId()

    // Initialize BroadcastChannel if available
    if (this.isBroadcastChannelSupported()) {
      this.initializeBroadcastChannel()
    }

    // Start heartbeat for tab health monitoring
    this.startHeartbeat()

    // Clean up old tab data
    this.startCleanup()

    // Listen for storage events as fallback
    this.listenForStorageEvents()
  }

  /**
   * Subscribe to changes for a specific key
   */
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }

    this.listeners.get(key)!.push(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  /**
   * Broadcast a change to all tabs
   */
  broadcast<T>(key: string, data: T): void {
    const message: TabSyncMessage = {
      type: 'state_update',
      key,
      data,
      timestamp: Date.now(),
      sourceTab: this.tabId
    }

    this.lastActivity = Date.now()

    // Try BroadcastChannel first
    if (this.channel) {
      try {
        this.channel.postMessage(message)
      } catch (error) {
        console.warn('BroadcastChannel failed, falling back to localStorage')
        this.fallbackToStorage(message)
      }
    } else {
      // Fallback to localStorage
      this.fallbackToStorage(message)
    }
  }

  /**
   * Update session data across tabs
   */
  updateSession(sessionId: string, context?: any): void {
    this.broadcast('session_change', { sessionId, context })
  }

  /**
   * Update activity data across tabs
   */
  // Removed updateActivity - using ai-elements instead
  updateActivityLegacy(activityId: string, updates: any): void {
    this.broadcast('activity_update', { activityId, updates })
  }

  /**
   * Get information about other active tabs
   */
  getActiveTabs(): string[] {
    const tabsKey = `${this.channelName}_tabs`
    const tabsData = safeStorage.get(tabsKey)

    if (tabsData.success && tabsData.data) {
      try {
        const tabs = JSON.parse(tabsData.data)
        const now = Date.now()
        const activeThreshold = this.HEARTBEAT_INTERVAL * 2

        return Object.entries(tabs)
          .filter(([_, timestamp]: [string, any]) => now - timestamp < activeThreshold)
          .map(([tabId]) => tabId)
      } catch {
        return [this.tabId]
      }
    }

    return [this.tabId]
  }

  /**
   * Check if this tab is the primary (oldest) tab
   */
  isPrimaryTab(): boolean {
    const activeTabs = this.getActiveTabs()
    return activeTabs.length === 0 || activeTabs[0] === this.tabId
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    if (this.channel) {
      this.channel.close()
      this.channel = null
    }

    this.listeners.clear()

    // Remove this tab from active tabs
    this.removeTabFromRegistry()
  }

  private initializeBroadcastChannel(): void {
    try {
      this.channel = new BroadcastChannel(this.channelName)

      this.channel.onmessage = (event) => {
        const message: TabSyncMessage = event.data

        // Ignore messages from self
        if (message.sourceTab === this.tabId) return

        this.handleMessage(message)
      }

      this.channel.onmessageerror = (error) => {
        console.warn('BroadcastChannel message error:', error)
      }
    } catch (error) {
      console.warn('BroadcastChannel not available:', error)
      this.channel = null
    }
  }

  private handleMessage(message: TabSyncMessage): void {
    const listeners = this.listeners.get(message.key)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          console.error('Error in tab sync listener:', error)
        }
      })
    }
  }

  private fallbackToStorage(message: TabSyncMessage): void {
    const storageKey = `${this.channelName}_${message.key}_${Date.now()}`
    safeStorage.set(storageKey, message)

    // Clean up old messages after a delay
    setTimeout(() => {
      safeStorage.remove(storageKey)
    }, 5000)
  }

  private listenForStorageEvents(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith(this.channelName)) {
          try {
            const message = JSON.parse(event.newValue || '{}')
            if (message.sourceTab !== this.tabId) {
              this.handleMessage(message)
            }
          } catch {
            // Ignore invalid storage events
          }
        }
      })
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.updateTabRegistry()
    }, this.HEARTBEAT_INTERVAL)
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMessages()
    }, this.CLEANUP_INTERVAL)
  }

  private updateTabRegistry(): void {
    const tabsKey = `${this.channelName}_tabs`
    const tabsData = safeStorage.get(tabsKey)

    let tabs: Record<string, number> = {}
    if (tabsData.success && tabsData.data) {
      try {
        tabs = JSON.parse(tabsData.data)
      } catch {
        tabs = {}
      }
    }

    // Update this tab's heartbeat
    tabs[this.tabId] = Date.now()

    safeStorage.set(tabsKey, JSON.stringify(tabs))
  }

  private removeTabFromRegistry(): void {
    const tabsKey = `${this.channelName}_tabs`
    const tabsData = safeStorage.get(tabsKey)

    if (tabsData.success && tabsData.data) {
      try {
        const tabs = JSON.parse(tabsData.data)
        delete tabs[this.tabId]
        safeStorage.set(tabsKey, JSON.stringify(tabs))
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private cleanupOldMessages(): void {
    const cutoff = Date.now() - (5 * 60 * 1000) // 5 minutes ago

    if (safeStorage.getAllKeys().success) {
      const keys = safeStorage.getAllKeys().data || []

      for (const key of keys) {
        if (key.startsWith(`${this.channelName}_`) && key.includes('_')) {
          try {
            const data = safeStorage.get(key)
            if (data.success && data.data) {
              const message = JSON.parse(data.data)
              if (message.timestamp && message.timestamp < cutoff) {
                safeStorage.remove(key)
              }
            }
          } catch {
            // Remove invalid entries
            safeStorage.remove(key)
          }
        }
      }
    }
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isBroadcastChannelSupported(): boolean {
    return typeof BroadcastChannel !== 'undefined'
  }
}

// Export singleton instance
export const tabSync = new TabSync('fbc-chat-sync')
