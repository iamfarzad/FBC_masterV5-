"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { HardDrive, AlertTriangle, CheckCircle } from 'lucide-react'
import { type SystemMetrics } from '../SystemHealthDashboard'

interface StorageTabProps {
  metrics: SystemMetrics
}

export function StorageTab({ metrics }: StorageTabProps) {
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
                {storage?.quotaExceeded ? 'Storage quota exceeded' : 'Storage within limits'}
              </span>
            </div>
            {storage && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Quota Used:</span>
                  <Badge variant={storage.quotaExceeded ? "destructive" : "default"}>
                    {((storage.localStorageUsed / (5 * 1024 * 1024)) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{((5 * 1024 * 1024 - storage.localStorageUsed) / (1024 * 1024)).toFixed(1)}MB</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
