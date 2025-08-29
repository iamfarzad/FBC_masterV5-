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
import { cn } from '@/lib/utils'

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
      const interval = setInterval(refreshMetrics, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">Real-time monitoring of all F.B/c AI systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={refreshMetrics} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="System Health"
          value={getHealthScore(metrics)}
          icon={<Activity className="h-4 w-4" />}
          status={getHealthStatus(metrics)}
          description="Overall system performance"
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

// Helper Components
function MetricCard({
  title,
  value,
  icon,
  status,
  description
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  status: 'good' | 'warning' | 'error'
  description: string
}) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", statusColors[status])}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

function PerformanceTab({ metrics }: { metrics: SystemMetrics }) {
  const perf = metrics.performance

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Response Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Average Response:</span>
              <Badge variant={perf.averageResponseTime < 2000 ? "default" : "destructive"}>
                {perf.averageResponseTime.toFixed(0)}ms
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Metrics:</span>
              <span>{perf.totalMetrics}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Slowest Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {perf.slowestOperations.slice(0, 5).map((op: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="truncate">{op.name}</span>
                <Badge variant="outline">{op.value.toFixed(0)}ms</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MemoryTab({ metrics }: { metrics: SystemMetrics }) {
  const memory = metrics.memory

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Memory</span>
                <span>{(memory.used / (1024 * 1024)).toFixed(1)}MB</span>
              </div>
              <Progress value={memory.percentage * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{(memory.total / (1024 * 1024)).toFixed(1)}MB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Limit</p>
                <p className="font-medium">{(memory.limit / (1024 * 1024)).toFixed(1)}MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {memory.percentage > 0.8 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {memory.percentage > 0.8 ? 'High memory usage' : 'Memory usage normal'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CacheTab({ metrics }: { metrics: SystemMetrics }) {
  const cache = metrics.cache

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Hit Rate</span>
                <span>{(cache.hitRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={cache.hitRate * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Requests</p>
                <p className="font-medium">{cache.totalRequests}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cached Entries</p>
                <p className="font-medium">{cache.entriesCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cache Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <Badge variant="outline">{cache.memoryUsage.toFixed(1)}MB</Badge>
            </div>
            <div className="flex justify-between">
              <span>Avg Entry Size:</span>
              <Badge variant="outline">{cache.averageEntrySize.toFixed(0)} bytes</Badge>
            </div>
            <div className="flex justify-between">
              <span>Compression Ratio:</span>
              <Badge variant="outline">{(cache.compressionRatio * 100).toFixed(1)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StreamingTab({ metrics }: { metrics: SystemMetrics }) {
  const streaming = metrics.streaming

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Streaming Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Active Streams</p>
                <p className="text-2xl font-bold">{streaming.activeStreams}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{streaming.throughputMbps.toFixed(1)}<span className="text-sm">Mbps</span></p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Processed Streams:</span>
                <span>{streaming.totalStreamsProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span>{streaming.averageStreamDuration.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <Badge variant={streaming.errorRate > 0.1 ? "destructive" : "default"}>
                  {(streaming.errorRate * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streaming Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {streaming.activeStreams > 5 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {streaming.activeStreams > 5 ? 'High stream load' : 'Streams normal'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StorageTab({ metrics }: { metrics: SystemMetrics }) {
  const storage = metrics.storage

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storage ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>LocalStorage</span>
                  <span>{storage.localStorageUsed} bytes</span>
                </div>
                <Progress value={(storage.localStorageUsed / (5 * 1024 * 1024)) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Memory Items</p>
                  <p className="font-medium">{storage.memoryStorageUsed}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fallback Mode</p>
                  <Badge variant={storage.usingFallback ? "destructive" : "default"}>
                    {storage.usingFallback ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Storage data unavailable</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {storage?.quotaExceeded ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">
                {storage?.quotaExceeded ? 'Storage quota exceeded' : 'Storage normal'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SystemTab({ metrics }: { metrics: SystemMetrics }) {
  const browser = metrics.browser
  const tabs = metrics.tabs

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Browser Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Browser:</span>
              <Badge variant="outline">{browser.name} {browser.version}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <Badge variant="outline">
                {browser.isMobile ? 'Mobile' : browser.isDesktop ? 'Desktop' : 'Tablet'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {browser.userAgent}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tab Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Active Tabs:</span>
              <Badge variant="outline">{tabs.activeTabs}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Primary Tab:</span>
              <Badge variant={tabs.isPrimaryTab ? "default" : "secondary"}>
                {tabs.isPrimaryTab ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Functions
function getHealthScore(metrics: SystemMetrics): number {
  let score = 100

  // Memory usage penalty
  if (metrics.memory.percentage > 0.8) score -= 20

  // Cache hit rate bonus/penalty
  if (metrics.cache.hitRate < 0.5) score -= 15
  else if (metrics.cache.hitRate > 0.8) score += 5

  // Streaming error penalty
  if (metrics.streaming.errorRate > 0.1) score -= 10

  // Storage quota penalty
  if (metrics.storage?.quotaExceeded) score -= 25

  return Math.max(0, Math.min(100, score))
}

function getHealthStatus(metrics: SystemMetrics): 'good' | 'warning' | 'error' {
  const score = getHealthScore(metrics)

  if (score >= 80) return 'good'
  if (score >= 60) return 'warning'
  return 'error'
}

