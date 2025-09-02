'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, MessageSquare, Zap } from 'lucide-react'
import { CapabilityAware } from '@/components/intelligence/CapabilityAware'

/**
 * 🎯 DEMO: AI Capability Awareness  
 * Shows how the AI can communicate its capabilities
 */

const DEMO_CONVERSATIONS = [
  {
    id: 'what-can-you-do',
    user: "What can you do?",
    ai: `I'm F.B/c, your AI business consultant with these capabilities:

**Analysis Tools:**
• **ROI Calculator**: Calculate return on investment with detailed financial projections
• **Document Analysis**: Analyze PDFs, contracts, and business documents for insights  
• **Screen Analysis**: Share your screen so I can analyze workflows and processes

**Research Tools:**
• **Grounded Web Search**: Search the web for current information with cited sources
• **Lead Research**: Automatically research companies and contacts from their email/domain

**Interactive Tools:**  
• **Voice Chat**: Have real-time voice conversations via Gemini Live API
• **Webcam Analysis**: Capture and analyze images in real-time

**Automation Tools:**
• **Meeting Scheduler**: Book consultation calls via integrated calendar
• **PDF Generation**: Export our conversation as a professional summary
• **Translation**: Translate content between multiple languages
• **Video → App**: Convert YouTube videos into interactive app blueprints

Just tell me what you need help with, and I'll suggest the best tool for the job!`
  },
  {
    id: 'roi-mention',
    user: "I need to calculate the ROI for a new automation project",
    ai: `I can help you with that! Let me use my **ROI Calculator** tool to analyze your automation project.

This tool will help us calculate:
• Return on investment percentage
• Payback period in months  
• Net profit projections
• Monthly profit analysis

Would you like to start the ROI calculation? I'll guide you through entering your project details, current costs, and expected benefits.`
  },
  {
    id: 'voice-suggestion',
    user: "Can we talk instead of typing?",
    ai: `Absolutely! I have **Voice Chat** capabilities powered by Google's Gemini Live API. 

I can:
• Have real-time voice conversations
• Understand and respond with natural speech
• Process audio in real-time
• Maintain context across voice and text

Would you like to start a voice conversation? Just click the voice button and we can talk naturally about your business needs.`
  }
]

export function CapabilityDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5 text-accent" />
            AI Capability Awareness Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your AI now has comprehensive knowledge of its capabilities and can communicate them effectively to users.
          </p>
          
          {/* Capability Overview */}
          <CapabilityAware variant="compact" />
          
          {/* Demo Conversations */}
          <div className="space-y-3">
            <h4 className="font-medium">Example Responses:</h4>
            <div className="grid gap-3">
              {DEMO_CONVERSATIONS.map(demo => (
                <Card key={demo.id} className="border-accent/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* User Message */}
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">User</Badge>
                        <div className="text-sm font-medium">{demo.user}</div>
                      </div>
                      
                      {/* AI Response Toggle */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-accent/10 text-xs text-accent">F.B/c AI</Badge>
                            <span className="text-xs text-muted-foreground">Capability-aware response</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
                          >
                            {activeDemo === demo.id ? 'Hide' : 'Show'} Response
                          </Button>
                        </div>
                        
                        {activeDemo === demo.id && (
                          <div className="bg-accent/5 border-accent/30 whitespace-pre-line border-l-2 py-3 pl-4 text-sm">
                            {demo.ai}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Full Capability View */}
          <div className="border-t pt-4">
            <CapabilityAware variant="full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CapabilityDemo
