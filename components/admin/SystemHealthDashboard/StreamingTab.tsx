"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { type SystemMetrics } from '../SystemHealthDashboard'

interface StreamingTabProps {
  metrics: SystemMetrics
}

export function StreamingTab({ metrics }: StreamingTabProps) {
  const streaming = metrics.streaming

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Streaming Metrics
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
