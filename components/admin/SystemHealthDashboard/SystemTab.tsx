"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Server, Cpu, Shield, Users, Activity } from 'lucide-react'
import { type SystemMetrics } from '../SystemHealthDashboard'

interface SystemTabProps {
  metrics: SystemMetrics
}

export function SystemTab({ metrics }: SystemTabProps) {
  const browser = metrics.browser
  const tabs = metrics.tabs

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Browser Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Browser:</span>
              <Badge variant="outline">{browser?.name || 'Unknown'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <Badge variant="outline">{browser?.version || 'Unknown'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="text-xs text-muted-foreground max-w-32 truncate">
                {browser?.userAgent || 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
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
