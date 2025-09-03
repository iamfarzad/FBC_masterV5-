/**
 * Cache Cleanup Service
 * Manages cache cleanup and provides monitoring for the Gemini optimization system
 */

import { geminiConfig } from './gemini-config-enhanced';

export class CacheCleanupService {
  private static instance: CacheCleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): CacheCleanupService {
    if (!CacheCleanupService.instance) {
      CacheCleanupService.instance = new CacheCleanupService();
    }
    return CacheCleanupService.instance;
  }

  /**
   * Start automatic cache cleanup
   */
  startCleanup(intervalMinutes: number = 30): void {
    if (this.cleanupInterval) {
      // Action logged
      return;
    }

    // Action logged`);
    
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMinutes * 60 * 1000);

    // Perform initial cleanup
    this.performCleanup();
  }

  /**
   * Stop automatic cache cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      // Action logged
    }
  }

  /**
   * Perform cache cleanup
   */
  performCleanup(): void {
    try {
      const statsBefore = geminiConfig.getCacheStats();
      geminiConfig.clearExpiredCache();
      const statsAfter = geminiConfig.getCacheStats();
      
      // Action logged
    } catch (error) {
    console.error('❌ Cache cleanup failed', error)
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return geminiConfig.getCacheStats();
  }

  /**
   * Force clear all cache
   */
  clearAllCache(): void {
    // Action logged
    geminiConfig.clearAllCache(); // Clear all cache entries
  }
}

// Singleton instance
export const cacheCleanupService = CacheCleanupService.getInstance();

// Auto-start cleanup in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Start cleanup service after a delay to avoid startup issues
  setTimeout(() => {
    cacheCleanupService.startCleanup(30); // Clean every 30 minutes
  }, 60000); // Wait 1 minute after startup
}

// Export convenience functions
export const startCacheCleanup = (intervalMinutes?: number) => {
  return cacheCleanupService.startCleanup(intervalMinutes);
};

export const stopCacheCleanup = () => {
  return cacheCleanupService.stopCleanup();
};

export const getCacheStats = () => {
  return cacheCleanupService.getCacheStats();
};

export const performCacheCleanup = () => {
  return cacheCleanupService.performCleanup();
};