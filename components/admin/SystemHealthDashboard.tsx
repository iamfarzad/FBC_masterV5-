// 🏥 SYSTEM HEALTH DASHBOARD - Complete System Monitoring
// WHY: Real-time view of all system health metrics for proactive management
// BUSINESS IMPACT: Prevent issues before they affect clients, optimize performance

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Zap,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Server,
  MemoryStick,
  Network
} from 'lucide-react'
import { performanceMonitor } from '@/src/core/monitoring/performance-monitor'
import { safeStorage } from '@/src/core/storage/safe-storage'
import { browserFeatures } from '@/src/core/browser/feature-detection'
import { tabSync } from '@/src/core/state/tab-sync'
import { streamingOptimizer } from '@/src/core/streaming/streaming-optimizer'
import { advancedCache } from '@/src/core/cache/advanced-cache'
import { cn } from '@/src/core/utils'

// Extracted Components
import {
  MetricCard,
  PerformanceTab,
  MemoryTab,
  CacheTab,
  StreamingTab,
  StorageTab,
  SystemTab,
  getHealthScore,
  getHealthStatus,
  getStatusBadgeVariant,
  getStatusIcon
} from './SystemHealthDashboard/'

interface SystemMetrics {
  performance: any
  memory: any
  cache: any
  streaming: any
  storage: any
  browser: any
  tabs: any
  errors: any[]
}

export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const refreshMetrics = async () => {
    try {
      const [
        performance,
        memory,
        cache,
        streaming,
        storage,
        browser,
        tabs
      ] = await Promise.all([
        performanceMonitor.getPerformanceSummary(),
        performanceMonitor.getMemoryUsage(),
        advancedCache.getCacheMetrics(),
        streamingOptimizer.getStreamHealth(),
        safeStorage.getUsageInfo(),
        Promise.resolve(browserFeatures.getBrowserInfo()),
        Promise.resolve({
          activeTabs: tabSync.getActiveTabs().length,
          isPrimaryTab: tabSync.isPrimaryTab()
        })
      ])

      setMetrics({
        performance,
        memory,
        cache,
        streaming,
        storage: storage.success ? storage.data : null,
        browser,
        tabs,
        errors: [] // Would collect from error monitoring service
      })
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshMetrics()

    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Activity className="h-8 w-8 animate-spin mx-auto text-brand" />
          <p className="text-muted-foreground">Loading system metrics...</p>
        </div>
      </div>
    )
  }

  const healthScore = getHealthScore(metrics)
  const healthStatus = getHealthStatus(metrics)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and health metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{healthScore}/100</div>
            <div className="text-sm text-muted-foreground">
              Health Score {getStatusIcon(healthStatus)}
            </div>
          </div>
          <Button
            onClick={refreshMetrics}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Performance"
          value={`${metrics.performance.fps} FPS`}
          icon={<Zap className="h-4 w-4" />}
          status={metrics.performance.fps > 50 ? "good" : "warning"}
          description={`Load: ${metrics.performance.loadTime}ms`}
        />
        <MetricCard
          title="Memory Usage"
          value={`${(metrics.memory.percentage * 100).toFixed(1)}%`}
          icon={<MemoryStick className="h-4 w-4" />}
          status={metrics.memory.percentage > 0.8 ? "warning" : "good"}
          description={`${(metrics.memory.used / (1024 * 1024)).toFixed(1)}MB used`}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${(metrics.cache.hitRate * 100).toFixed(1)}%`}
          icon={<Database className="h-4 w-4" />}
          status={metrics.cache.hitRate > 0.7 ? "good" : "warning"}
          description={`${metrics.cache.entriesCount} cached entries`}
        />
        <MetricCard
          title="Active Streams"
          value={metrics.streaming.activeStreams}
          icon={<Network className="h-4 w-4" />}
          status={metrics.streaming.activeStreams > 5 ? "warning" : "good"}
          description={`${metrics.streaming.throughputMbps.toFixed(1)} Mbps`}
        />
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <MemoryTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="streaming" className="space-y-4">
          <StreamingTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <StorageTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemTab metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export types for external use
export type { SystemMetrics }
