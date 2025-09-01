import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3 } from 'lucide-react'

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

interface PerformanceTabProps {
  metrics: SystemMetrics
}

export function PerformanceTab({ metrics }: PerformanceTabProps) {
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
