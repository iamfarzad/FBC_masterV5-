export interface TabSyncMessage {
  type: string
  data: any
  timestamp: number
  tabId: string
}

export class TabSync {
  private channel: BroadcastChannel | null = null
  private tabId: string
  private listeners = new Map<string, Set<(data: any) => void>>()
  private isLeader = false
  private leaderElection: any = null

  constructor(channelName: string = 'fbc-tab-sync') {
    this.tabId = this.generateTabId()
    
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(channelName)
      this.setupChannel()
      this.electLeader()
    }
  }

  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private setupChannel(): void {
    if (!this.channel) return

    this.channel.onmessage = (event: MessageEvent<TabSyncMessage>) => {
      const { type, data, tabId } = event.data
      
      // Ignore messages from self
      if (tabId === this.tabId) return

      // Handle leader election
      if (type === 'leader-election') {
        this.handleLeaderElection(data)
        return
      }

      // Notify listeners
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.forEach(listener => listener(data))
      }
    }

    // Notify other tabs when closing
    window.addEventListener('beforeunload', () => {
      this.broadcast('tab-closed', { tabId: this.tabId })
      if (this.isLeader) {
        this.broadcast('leader-election', { type: 'leader-resigned' })
      }
    })
  }

  private electLeader(): void {
    // Simple leader election: first tab becomes leader
    this.broadcast('leader-election', { 
      type: 'request-leader',
      tabId: this.tabId,
      timestamp: Date.now()
    })

    // If no response in 100ms, become leader
    setTimeout(() => {
      if (!this.isLeader) {
        this.becomeLeader()
      }
    }, 100)
  }

  private handleLeaderElection(data: any): void {
    if (data.type === 'request-leader' && this.isLeader) {
      // Respond that we're the leader
      this.broadcast('leader-election', {
        type: 'leader-exists',
        leaderTabId: this.tabId
      })
    } else if (data.type === 'leader-exists') {
      // Another tab is leader
      this.isLeader = false
    } else if (data.type === 'leader-resigned') {
      // Leader resigned, elect new leader
      setTimeout(() => this.electLeader(), Math.random() * 100)
    }
  }

  private becomeLeader(): void {
    this.isLeader = true
    this.broadcast('leader-election', {
      type: 'new-leader',
      leaderTabId: this.tabId
    })
  }

  broadcast(type: string, data: any): void {
    if (!this.channel) return

    const message: TabSyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      tabId: this.tabId
    }

    this.channel.postMessage(message)
  }

  on(type: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    
    this.listeners.get(type)!.add(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  off(type: string, listener?: (data: any) => void): void {
    if (!listener) {
      // Remove all listeners for this type
      this.listeners.delete(type)
    } else {
      // Remove specific listener
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  getTabId(): string {
    return this.tabId
  }

  isLeaderTab(): boolean {
    return this.isLeader
  }

  // Sync state across tabs
  syncState<T>(key: string, value: T): void {
    this.broadcast('state-sync', { key, value })
  }

  onStateSync(listener: (key: string, value: any) => void): () => void {
    return this.on('state-sync', ({ key, value }) => {
      listener(key, value)
    })
  }

  destroy(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.listeners.clear()
  }
}

export const tabSync = new TabSync()