// 🌐 BROWSER COMPATIBILITY & FEATURE DETECTION
// WHY: Ensures your app works on all devices and browsers
// BUSINESS IMPACT: No "doesn't work on my device" excuses from clients

export interface BrowserCapabilities {
  localStorage: boolean
  sessionStorage: boolean
  indexedDB: boolean
  webWorkers: boolean
  serviceWorkers: boolean
  webSockets: boolean
  webRTC: boolean
  mediaDevices: boolean
  geolocation: boolean
  notifications: boolean
  vibration: boolean
  battery: boolean
  onlineStatus: boolean
  touchEvents: boolean
  pointerEvents: boolean
  passiveEvents: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  mutationObserver: boolean
  performanceObserver: boolean
  broadcastChannel: boolean
  sharedWorkers: boolean
  webGL: boolean
  webGL2: boolean
  canvas: boolean
  audio: boolean
  video: boolean
  fullscreen: boolean
  clipboard: boolean
  fileAPI: boolean
  dragAndDrop: boolean
  historyAPI: boolean
  webAnimations: boolean
  cssGrid: boolean
  cssFlexbox: boolean
  cssCustomProperties: boolean
  es6: boolean
  asyncAwait: boolean
  promises: boolean
  fetch: boolean
  webCrypto: boolean
}

export class BrowserFeatureDetector {
  private capabilities: BrowserCapabilities | null = null

  /**
   * Detect all browser capabilities
   */
  detectAllCapabilities(): BrowserCapabilities {
    if (this.capabilities) return this.capabilities

    this.capabilities = {
      // Storage
      localStorage: this.hasLocalStorage(),
      sessionStorage: this.hasSessionStorage(),
      indexedDB: this.hasIndexedDB(),

      // Workers
      webWorkers: this.hasWebWorkers(),
      serviceWorkers: this.hasServiceWorkers(),
      sharedWorkers: this.hasSharedWorkers(),

      // Network & Real-time
      webSockets: this.hasWebSockets(),
      webRTC: this.hasWebRTC(),
      broadcastChannel: this.hasBroadcastChannel(),

      // Device & Sensors
      mediaDevices: this.hasMediaDevices(),
      geolocation: this.hasGeolocation(),
      notifications: this.hasNotifications(),
      vibration: this.hasVibration(),
      battery: this.hasBattery(),
      onlineStatus: this.hasOnlineStatus(),

      // Events & Interactions
      touchEvents: this.hasTouchEvents(),
      pointerEvents: this.hasPointerEvents(),
      passiveEvents: this.hasPassiveEvents(),

      // Observers
      intersectionObserver: this.hasIntersectionObserver(),
      resizeObserver: this.hasResizeObserver(),
      mutationObserver: this.hasMutationObserver(),
      performanceObserver: this.hasPerformanceObserver(),

      // Graphics & Media
      webGL: this.hasWebGL(),
      webGL2: this.hasWebGL2(),
      canvas: this.hasCanvas(),
      audio: this.hasAudio(),
      video: this.hasVideo(),

      // Browser Features
      fullscreen: this.hasFullscreen(),
      clipboard: this.hasClipboard(),
      fileAPI: this.hasFileAPI(),
      dragAndDrop: this.hasDragAndDrop(),
      historyAPI: this.hasHistoryAPI(),
      webAnimations: this.hasWebAnimations(),

      // CSS Features
      cssGrid: this.hasCSSGrid(),
      cssFlexbox: this.hasCSSFlexbox(),
      cssCustomProperties: this.hasCSSCustomProperties(),

      // JavaScript Features
      es6: this.hasES6(),
      asyncAwait: this.hasAsyncAwait(),
      promises: this.hasPromises(),
      fetch: this.hasFetch(),
      webCrypto: this.hasWebCrypto()
    }

    return this.capabilities
  }

  /**
   * Get a specific capability
   */
  hasCapability(capability: keyof BrowserCapabilities): boolean {
    const caps = this.detectAllCapabilities()
    return caps[capability]
  }

  /**
   * Get browser compatibility score (0-100)
   */
  getCompatibilityScore(): number {
    const caps = this.detectAllCapabilities()
    const criticalFeatures = [
      caps.localStorage,
      caps.fetch,
      caps.promises,
      caps.canvas,
      caps.webSockets
    ]

    const criticalScore = (criticalFeatures.filter(Boolean).length / criticalFeatures.length) * 60

    const niceToHaveFeatures = [
      caps.serviceWorkers,
      caps.webRTC,
      caps.notifications,
      caps.geolocation,
      caps.webGL
    ]

    const niceToHaveScore = (niceToHaveFeatures.filter(Boolean).length / niceToHaveFeatures.length) * 40

    return Math.round(criticalScore + niceToHaveScore)
  }

  /**
   * Get browser information
   */
  getBrowserInfo(): {
    name: string
    version: string
    userAgent: string
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
  } {
    const ua = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?!.*\bPhone\b)|Tablet/i.test(ua)

    return {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
      userAgent: ua,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet
    }
  }

  /**
   * Check if browser meets minimum requirements
   */
  meetsMinimumRequirements(): boolean {
    const caps = this.detectAllCapabilities()
    const browser = this.getBrowserInfo()

    // Critical requirements
    const hasBasics = caps.fetch && caps.promises && caps.localStorage
    const notTooOld = !this.isOutdatedBrowser()

    return hasBasics && notTooOld
  }

  /**
   * Get list of missing features
   */
  getMissingFeatures(): (keyof BrowserCapabilities)[] {
    const caps = this.detectAllCapabilities()
    const missing: (keyof BrowserCapabilities)[] = []

    for (const [key, value] of Object.entries(caps)) {
      if (!value) {
        missing.push(key as keyof BrowserCapabilities)
      }
    }

    return missing
  }

  /**
   * Get recommended polyfills
   */
  getRecommendedPolyfills(): string[] {
    const missing = this.getMissingFeatures()
    const polyfills: string[] = []

    if (missing.includes('fetch')) polyfills.push('whatwg-fetch')
    if (missing.includes('promises')) polyfills.push('es6-promise')
    if (missing.includes('intersectionObserver')) polyfills.push('intersection-observer')
    if (missing.includes('webAnimations')) polyfills.push('web-animations-js')
    if (missing.includes('resizeObserver')) polyfills.push('resize-observer-polyfill')

    return polyfills
  }

  // Private detection methods
  private hasLocalStorage(): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private hasSessionStorage(): boolean {
    try {
      const test = '__test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private hasIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  private hasWebWorkers(): boolean {
    return 'Worker' in window
  }

  private hasServiceWorkers(): boolean {
    return 'serviceWorker' in navigator
  }

  private hasSharedWorkers(): boolean {
    return 'SharedWorker' in window
  }

  private hasWebSockets(): boolean {
    return 'WebSocket' in window
  }

  private hasWebRTC(): boolean {
    return 'RTCPeerConnection' in window
  }

  private hasBroadcastChannel(): boolean {
    return 'BroadcastChannel' in window
  }

  private hasMediaDevices(): boolean {
    return 'mediaDevices' in navigator
  }

  private hasGeolocation(): boolean {
    return 'geolocation' in navigator
  }

  private hasNotifications(): boolean {
    return 'Notification' in window
  }

  private hasVibration(): boolean {
    return 'vibrate' in navigator
  }

  private hasBattery(): boolean {
    return 'getBattery' in navigator
  }

  private hasOnlineStatus(): boolean {
    return 'onLine' in navigator
  }

  private hasTouchEvents(): boolean {
    return 'ontouchstart' in window
  }

  private hasPointerEvents(): boolean {
    return 'PointerEvent' in window
  }

  private hasPassiveEvents(): boolean {
    let supportsPassive = false
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => { supportsPassive = true }
      })
      window.addEventListener('test', null as any, opts)
    } catch {
      // Ignore
    }
    return supportsPassive
  }

  private hasIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window
  }

  private hasResizeObserver(): boolean {
    return 'ResizeObserver' in window
  }

  private hasMutationObserver(): boolean {
    return 'MutationObserver' in window
  }

  private hasPerformanceObserver(): boolean {
    return 'PerformanceObserver' in window
  }

  private hasWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }

  private hasWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch {
      return false
    }
  }

  private hasCanvas(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('2d')
    } catch {
      return false
    }
  }

  private hasAudio(): boolean {
    return 'Audio' in window
  }

  private hasVideo(): boolean {
    return 'HTMLVideoElement' in window
  }

  private hasFullscreen(): boolean {
    return 'requestFullscreen' in document.documentElement ||
           'webkitRequestFullscreen' in document.documentElement ||
           'mozRequestFullScreen' in document.documentElement
  }

  private hasClipboard(): boolean {
    return 'clipboard' in navigator
  }

  private hasFileAPI(): boolean {
    return 'File' in window && 'FileReader' in window
  }

  private hasDragAndDrop(): boolean {
    return 'ondragstart' in document.documentElement
  }

  private hasHistoryAPI(): boolean {
    return 'pushState' in history
  }

  private hasWebAnimations(): boolean {
    return 'animate' in document.documentElement
  }

  private hasCSSGrid(): boolean {
    return CSS.supports('display', 'grid')
  }

  private hasCSSFlexbox(): boolean {
    return CSS.supports('display', 'flex')
  }

  private hasCSSCustomProperties(): boolean {
    return CSS.supports('--test', 'value')
  }

  private hasES6(): boolean {
    try {
      eval('class Test {}; new Test()')
      return true
    } catch {
      return false
    }
  }

  private hasAsyncAwait(): boolean {
    try {
      eval('async function test() { await Promise.resolve() }')
      return true
    } catch {
      return false
    }
  }

  private hasPromises(): boolean {
    return 'Promise' in window
  }

  private hasFetch(): boolean {
    return 'fetch' in window
  }

  private hasWebCrypto(): boolean {
    return 'crypto' in window && 'subtle' in window.crypto
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
    if (ua.includes('Edge')) return 'Edge'
    if (ua.includes('Opera')) return 'Opera'
    return 'Unknown'
  }

  private getBrowserVersion(): string {
    const ua = navigator.userAgent
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/)
    return match ? match[2] : 'Unknown'
  }

  private isOutdatedBrowser(): boolean {
    const browser = this.getBrowserInfo()
    const version = parseInt(browser.version)

    switch (browser.name) {
      case 'Chrome': return version < 80
      case 'Firefox': return version < 75
      case 'Safari': return version < 13
      case 'Edge': return version < 80
      default: return false
    }
  }
}

// Export singleton instance
export const browserFeatures = new BrowserFeatureDetector()

