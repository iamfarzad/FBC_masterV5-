'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Brain, Calculator, Search, FileText, Mic, Camera, Monitor, 
  Globe, MessageSquare, Download, Code, Video, Zap
} from 'lucide-react'
import { cn } from '@/src/core/utils'
import { useCapabilities } from '@/hooks/useCapabilities'

interface CapabilityDisplayProps {
  sessionId?: string | null
  userEmail?: string | null
  onCapabilitySelect?: (capabilityId: string) => void
  variant?: 'grid' | 'list' | 'compact'
  className?: string
}

const CAPABILITY_ICONS: Record<string, React.ElementType> = {
  roi: Calculator,
  doc: FileText,
  search: Search,
  voice: Mic,
  webcam: Camera,
  screenShare: Monitor,
  translate: Globe,
  meetings: MessageSquare,
  exportPdf: Download,
  codeGen: Code,
  video2app: Video,
  leadResearch: Search,
  image: Camera,
  calculate: Calculator,
  urlContext: Globe
}

const CATEGORY_COLORS = {
  analysis: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  generation: 'bg-purple-500/10 text-purple-600 border-purple-500/20', 
  interaction: 'bg-green-500/10 text-green-600 border-green-500/20',
  research: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  automation: 'bg-red-500/10 text-red-600 border-red-500/20'
}

export function CapabilityDisplay({ 
  sessionId, 
  userEmail, 
  onCapabilitySelect,
  variant = 'grid',
  className 
}: CapabilityDisplayProps) {
  const {
    available,
    categories,
    isLoading,
    error,
    formatForDisplay,
    getCapabilityStatusText,
    stats
  } = useCapabilities({
    sessionId: sessionId ?? null,
    userEmail: userEmail ?? null
  })

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-6', className)}>
        <div className="text-center">
          <Brain className="mx-auto mb-2 size-8 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading capabilities...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <p className="text-sm text-destructive">Failed to load capabilities: {error}</p>
      </div>
    )
  }

  const capabilitiesByCategory = formatForDisplay()

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Brain className="size-4 text-accent" />
        <span className="text-muted-foreground">
          {stats.total} capabilities available
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="cursor-help">
                {Object.keys(capabilitiesByCategory).length} categories
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {stats.byCategory.map(cat => (
                  <div key={cat.category} className="flex justify-between gap-2">
                    <span>{cat.name}:</span>
                    <span>{cat.count}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {available.map(capability => {
          const IconComponent = CAPABILITY_ICONS[capability.id] || Zap
          return (
            <div
              key={capability.id}
              className="hover:bg-accent/5 flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors"
            >
              <IconComponent className="size-5 flex-shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{capability.name}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {capability.description}
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={cn('text-xs', CATEGORY_COLORS[capability.category])}
              >
                {categories[capability.category].name}
              </Badge>
              {onCapabilitySelect && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCapabilitySelect(capability.id)}
                  className="flex-shrink-0"
                >
                  Use
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Grid variant (default)
  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">AI Capabilities</h3>
        <p className="text-sm text-muted-foreground">
          {getCapabilityStatusText()}
        </p>
      </div>

      {Object.entries(capabilitiesByCategory).map(([categoryId, categoryCapabilities]) => {
        const categoryInfo = categories[categoryId as keyof typeof categories]
        return (
          <Card key={categoryId}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div 
                  className={cn(
                    'w-3 h-3 rounded-full',
                    CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS]?.split(' ')[0] || 'bg-accent'
                  )}
                />
                {categoryInfo.name}
                <Badge variant="secondary" className="ml-auto">
                  {categoryCapabilities.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {categoryCapabilities.map(capability => {
                  const IconComponent = CAPABILITY_ICONS[capability.id] || Zap
                  return (
                    <TooltipProvider key={capability.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer',
                              onCapabilitySelect && 'hover:border-accent/50'
                            )}
                            onClick={() => onCapabilitySelect?.(capability.id)}
                          >
                            <div className="flex items-start gap-3">
                              <IconComponent className="mt-0.5 size-5 flex-shrink-0 text-accent" />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium">{capability.name}</div>
                                <div className="line-clamp-2 text-xs text-muted-foreground">
                                  {capability.description}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <div className="font-medium">{capability.name}</div>
                            <div className="text-sm">{capability.description}</div>
                            {capability.examples.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <div className="mb-1 font-medium">Examples:</div>
                                <div>"{capability.examples[0]}"</div>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Hook for getting capability suggestions based on user input
export function useCapabilitySuggestions(userMessage: string, sessionId?: string | null) {
  const { available, getSuggestedCapabilities } = useCapabilities({
    sessionId: sessionId ?? null
  })

  const suggestions = useMemo(() => {
    if (!userMessage.trim()) return []
    return getSuggestedCapabilities?.(userMessage) || []
  }, [userMessage, getSuggestedCapabilities])

  return {
    suggestions,
    hasSuggestions: suggestions.length > 0,
    total: available.length
  }
}

// Hook for capability status and availability
export function useCapabilityStatus(capabilityId: string, sessionId?: string | null) {
  const { hasCapability, getCapability, isLoading } = useCapabilities({
    sessionId: sessionId ?? null
  })
  
  return {
    isAvailable: hasCapability(capabilityId),
    capability: getCapability(capabilityId),
    isLoading
  }
}

export default useCapabilities
