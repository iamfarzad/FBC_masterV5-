"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { QUICK_ACTIONS, QuickAction } from './QuickActionsConfig'

interface QuickActionsProps {
  onActionClick: (prompt: string) => void
  className?: string
}

export function QuickActions({ onActionClick, className }: QuickActionsProps) {
  const handleActionClick = (action: QuickAction) => {
    onActionClick(action.prompt)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        "h-auto p-4 flex flex-col items-center gap-3 text-center",
                        "hover:bg-accent/5 transition-all duration-300",
                        "border-border/30 rounded-xl group",
                        "bg-card/50 backdrop-blur-sm hover:shadow-lg"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-r from-primary/20 to-primary/10",
                        "group-hover:from-primary/30 group-hover:to-primary/20",
                        "transition-all duration-300"
                      )}>
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-foreground">
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {action.description}
                        </div>
                        <div className="flex items-center justify-center">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            action.category === 'system'
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          )}>
                            {action.category}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
