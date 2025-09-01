"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { type SystemMetrics } from '../SystemHealthDashboard'

interface CacheTabProps {
  metrics: SystemMetrics
}

export function CacheTab({ metrics }: CacheTabProps) {
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
              <div>
                <p className="text-muted-foreground">Hits</p>
                <p className="font-medium text-green-600">{cache.hits}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Misses</p>
                <p className="font-medium text-orange-600">{cache.misses}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cache Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {cache.hitRate > 0.7 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {cache.hitRate > 0.7 ? 'Cache performing well' : 'Cache hit rate could be improved'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Average Response Time:</span>
                <Badge variant="outline">{cache.averageResponseTime?.toFixed(0) || 'N/A'}ms</Badge>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <Badge variant="outline">{cache.memoryUsage || 'N/A'} bytes</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
