"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, TrendingUp, Target, Users } from 'lucide-react'

export function ProgressTracker() {
  const metrics = [
    { label: 'AI Implementation Hours', value: '10,000+', icon: Brain },
    { label: 'Businesses Automated', value: '500+', icon: Users },
    { label: 'Average ROI Increase', value: '85%', icon: TrendingUp },
    { label: 'Success Rate', value: '95%', icon: Target }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl"
    >
      <Card className="glass-card border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-holographic mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Badge variant="outline" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              Real-World AI Experience
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
