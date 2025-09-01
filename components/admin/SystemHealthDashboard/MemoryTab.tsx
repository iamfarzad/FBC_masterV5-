import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MemoryStick, AlertTriangle, CheckCircle } from 'lucide-react'

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

interface MemoryTabProps {
  metrics: SystemMetrics
}

export function MemoryTab({ metrics }: MemoryTabProps) {
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
