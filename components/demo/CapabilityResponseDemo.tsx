'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Response } from '@/components/ai-elements/response'
import { MessageContent } from '@/components/ai-elements/message'

/**
 * 🎯 Demo of AI's New Capability-Aware Responses
 * Shows the before/after of how the AI responds to capability questions
 */

const BEFORE_RESPONSE = `As F.B/c, I possess a wide range of capabilities designed to help businesses thrive. My expertise spans several key areas:

* **Business Strategy & Optimization:** I can analyze your business model, identify areas for improvement, and develop strategies for growth and increased profitability.

* **ROI Calculation & Financial Analysis:** I can perform detailed financial modeling to assess the return on investment for various projects and initiatives.

* **Process Automation Recommendations:** I can analyze your current workflows and recommend automation solutions to streamline operations.

To best leverage my capabilities, please tell me about your specific business needs and challenges.`

const AFTER_RESPONSE = `I can launch these tools directly in our chat interface:

🧮 **ROI Calculator** - I'll open the interactive calculator right here for financial analysis
<button data-coach-cta data-tool="roi">Launch ROI Calculator</button>

📷 **Webcam Capture** - I can activate your webcam for real-time image analysis  
<button data-coach-cta data-tool="webcam">Activate Webcam</button>

🖥️ **Screen Share** - I can help you share your screen for workflow optimization
<button data-coach-cta data-tool="screen">Share Screen</button>

🎙️ **Voice Chat** - I can start a live voice conversation using Gemini Live API
<button data-coach-cta data-tool="voice">Start Voice Chat</button>

📄 **Document Analysis** - Upload PDFs and I'll analyze them for insights
<button data-coach-cta data-tool="document">Analyze Document</button>

🔍 **Web Search** - I'll search the web and provide grounded, cited answers
<button data-coach-cta data-tool="search" data-query="AI automation trends">Search Web</button>

🎥 **Video → App** - Give me a YouTube link and I'll generate an interactive app
<button data-coach-cta data-tool="video">Video to App</button>

📧 **Meeting Scheduler** - I can book consultation calls through my calendar
<button data-coach-cta data-tool="meeting">Book Consultation</button>

Want to try any of these? Just click a button or tell me what you need help with!`

export function CapabilityResponseDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Capability Awareness: Before vs After</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Question */}
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">User Question</Badge>
            </div>
            <p className="font-medium">
              "What capabilities do you have?"
            </p>
          </div>

          {/* Before Response */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-100 text-red-700">❌ Before (Vague)</Badge>
            </div>
            <MessageContent>
              <Response parseIncompleteMarkdown={false}>
                {BEFORE_RESPONSE}
              </Response>
            </MessageContent>
          </div>

          {/* After Response */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-700">✅ After (Actionable)</Badge>
            </div>
            <MessageContent>
              <Response parseIncompleteMarkdown={false}>
                {AFTER_RESPONSE}
              </Response>
            </MessageContent>
          </div>

          {/* Key Improvements */}
          <div className="bg-accent/5 border-accent/20 rounded-lg border p-4">
            <h4 className="mb-2 font-medium">🎯 Key Improvements:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ <strong>Specific tools</strong> instead of vague categories</li>
              <li>✅ <strong>Clickable buttons</strong> to launch tools instantly</li>
              <li>✅ <strong>Clear descriptions</strong> of what each tool does</li>
              <li>✅ <strong>Action-oriented language</strong> ("I'll open", "I can activate")</li>
              <li>✅ <strong>Visual icons</strong> for better recognition</li>
            </ul>
          </div>

          {/* Activity Response Demo */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="font-medium">Response to Activity Mention:</h4>
            
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">User</Badge>
              </div>
              <p className="font-medium">
                "Recent Activity Activating Webcam Capture completed"
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-700">✅ New Response</Badge>
              </div>
              <MessageContent>
                <Response parseIncompleteMarkdown={false}>
                  {`Great! I see the webcam capture was just activated successfully. Now I can analyze any images you capture for business insights.

<button data-coach-cta data-tool="webcam">Capture & Analyze Image</button>

This visual analysis can help with workflow optimization, document review, or process analysis. What would you like me to analyze?`}
                </Response>
              </MessageContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CapabilityResponseDemo
