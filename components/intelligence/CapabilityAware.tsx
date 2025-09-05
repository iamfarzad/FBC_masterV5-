'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Calculator, Search, FileText, Mic, Camera, Monitor } from 'lucide-react'

/**
 * 🧠 Simple AI Capability Awareness Component
 * Shows what the AI can do - matches the capability registry
 */

const CORE_CAPABILITIES = [
  {
    id: 'roi',
    name: 'ROI Calculator', 
    description: 'Financial analysis with payback period and profit projections',
    icon: Calculator,
    category: 'Analysis'
  },
  {
    id: 'search',
    name: 'Grounded Web Search',
    description: 'Real-time web research with cited sources',
    icon: Search, 
    category: 'Research'
  },
  {
    id: 'voice',
    name: 'Voice Chat',
    description: 'Real-time voice conversations via Gemini Live',
    icon: Mic,
    category: 'Interaction'
  },
  {
    id: 'webcam',
    name: 'Webcam Analysis',
    description: 'Real-time image capture and analysis', 
    icon: Camera,
    category: 'Interaction'
  },
  {
    id: 'screenShare',
    name: 'Screen Analysis',
    description: 'Workflow optimization via screen sharing',
    icon: Monitor,
    category: 'Analysis'
  },
  {
    id: 'doc',
    name: 'Document Analysis',
    description: 'PDF and document processing for insights',
    icon: FileText,
    category: 'Analysis'
  }
] as const

interface CapabilityAwareProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function CapabilityAware({ variant = 'compact', className }: CapabilityAwareProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className || ''}`}>
        <Brain className="size-4 text-accent" />
        <span className="text-muted-foreground">{CORE_CAPABILITIES.length} capabilities available</span>
        <Badge variant="secondary">Ready</Badge>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-5 text-accent" />
          AI Capabilities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {CORE_CAPABILITIES.map(capability => {
            const IconComponent = capability.icon
            return (
              <div key={capability.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <IconComponent className="mt-0.5 size-5 flex-shrink-0 text-accent" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{capability.name}</div>
                  <div className="text-xs text-muted-foreground">{capability.description}</div>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {capability.category}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Get capability list as text for AI responses
 */
export function getCapabilityListText(): string {
  const categories = CORE_CAPABILITIES.reduce((acc, cap) => {
    if (!acc[cap.category]) acc[cap.category] = []
    acc[cap.category]!.push(cap)
    return acc
  }, {} as Record<string, typeof CORE_CAPABILITIES[number][]>)

  let text = "I have access to these tools:\n\n"
  
  Object.entries(categories).forEach(([category, caps]) => {
    text += `**${category} Tools:**\n`
    caps.forEach(cap => {
      text += `• **${cap.name}**: ${cap.description}\n`
    })
    text += '\n'
  })
  
  text += "Just mention what you need help with, and I'll suggest the right tool!"
  
  return text
}

export default CapabilityAware
