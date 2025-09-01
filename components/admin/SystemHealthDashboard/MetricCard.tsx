import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/src/core/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  status: 'good' | 'warning' | 'error'
  description: string
}

export function MetricCard({
  title,
  value,
  icon,
  status,
  description
}: MetricCardProps) {
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
