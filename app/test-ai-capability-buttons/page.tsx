'use client'

import React, { useState } from 'react'
import { Response } from '@/components/ai-elements/response'
// import { MessageContent } from '@/components/ai-elements/message' // Temporarily disabled
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * 🧪 Test Page for AI Capability Buttons
 * Tests if the data-coach-cta buttons work to trigger tools
 */

const AI_RESPONSE_WITH_BUTTONS = `I can launch these tools directly in our chat:

🧮 **ROI Calculator** - I'll open the interactive calculator for financial analysis
<button data-coach-cta data-tool="roi">Launch ROI Calculator</button>

📷 **Webcam Capture** - I can activate your webcam for real-time analysis  
<button data-coach-cta data-tool="webcam">Activate Webcam</button>

🎙️ **Voice Chat** - I can start a live voice conversation
<button data-coach-cta data-tool="voice">Start Voice Chat</button>

🖥️ **Screen Share** - I can help you share your screen for analysis
<button data-coach-cta data-tool="screen">Share Screen</button>

🔍 **Web Search** - I'll search for current information
<button data-coach-cta data-tool="search" data-query="latest AI automation trends">Search AI Trends</button>

📧 **Meeting** - I can book a consultation call
<button data-coach-cta data-tool="meeting">Book Consultation</button>

Try clicking any button to test the tool launching system!`

export default function TestAICapabilityButtons() {
  const [lastTriggeredTool, setLastTriggeredTool] = useState<string | null>(null)

  // Test handler to see if buttons are working
  React.useEffect(() => {
    const handleTestCTA = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.hasAttribute('data-coach-cta')) {
        const tool = target.getAttribute('data-tool')
        const query = target.getAttribute('data-query')
        
        console.log('🧪 TEST: AI button clicked:', { tool, query })
        setLastTriggeredTool(`Tool: ${tool}${query ? `, Query: ${query}` : ''}`)
      }
    }

    document.addEventListener('click', handleTestCTA)
    return () => document.removeEventListener('click', handleTestCTA)
  }, [])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 AI Capability Button Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page tests the new AI capability awareness system. The buttons below are embedded 
              in AI responses and should trigger actual tool launching.
            </p>

            {lastTriggeredTool && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                <Badge variant="default" className="mb-2 bg-green-100 text-green-700">
                  ✅ Button Clicked
                </Badge>
                <p className="text-sm">{lastTriggeredTool}</p>
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <Badge variant="outline">AI Response with Tool Buttons</Badge>
              </div>
              
              {/* <MessageContent>
                <Response parseIncompleteMarkdown={false}>
                  {AI_RESPONSE_WITH_BUTTONS}
                </Response>
              </MessageContent> */}
              <div className="bg-muted p-4 rounded-lg">
                <Response parseIncompleteMarkdown={false}>
                  {AI_RESPONSE_WITH_BUTTONS}
                </Response>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Expected behavior:</strong></p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Clicking "Launch ROI Calculator" should open the ROI tool canvas</li>
                <li>Clicking "Activate Webcam" should open webcam capture</li>
                <li>Clicking "Start Voice Chat" should open the voice overlay</li>
                <li>Clicking "Share Screen" should activate screen sharing</li>
                <li>Clicking "Search AI Trends" should trigger web search</li>
                <li>Clicking "Book Consultation" should open meeting scheduler</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <Button 
                onClick={() => setLastTriggeredTool(null)}
                variant="outline"
                size="sm"
              >
                Reset Test
              </Button>
              <span className="ml-4 text-sm text-muted-foreground">
                Click any AI tool button above to test
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
