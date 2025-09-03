'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  Monitor, 
  FileText,
  Mic,
  Upload,
  Link,
  Calculator,
  Brain,
  MessageSquare,
  Search,
  Code,
  Globe,
  Loader2,
  Check,
  X
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  action: () => Promise<void>
}

import { LiveStreamingTools } from './LiveStreamingTools'

export function ChatTools({ onToolResult }: { onToolResult: (result: any) => void }) {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const handleWebcam = async () => {
    try {
      setLoading(true)
      setActiveTool('webcam')
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      // Capture frame after 1 second
      setTimeout(async () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0)
        
        const imageData = canvas.toDataURL('image/png')
        
        // Send to API
        const response = await fetch('/api/tools/webcam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        })
        
        const result = await response.json()
        onToolResult({
          tool: 'webcam',
          ...result
        })
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
      }, 1000)
      
    } catch (error) {
      console.error('Webcam error:', error)
      onToolResult({
        tool: 'webcam',
        error: 'Failed to access webcam'
      })
    } finally {
      setLoading(false)
      setActiveTool(null)
    }
  }

  const handleScreenShare = async () => {
    try {
      setLoading(true)
      setActiveTool('screen')
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      
      // Start sharing session
      const response = await fetch('/api/tools/screen-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
      
      const result = await response.json()
      onToolResult({
        tool: 'screen-share',
        ...result
      })
      
      // Clean up after 5 seconds (demo)
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
      }, 5000)
      
    } catch (error) {
      console.error('Screen share error:', error)
      onToolResult({
        tool: 'screen-share',
        error: 'Failed to share screen'
      })
    } finally {
      setLoading(false)
      setActiveTool(null)
    }
  }

  const handlePDF = async (action: 'create' | 'summarize') => {
    try {
      setLoading(true)
      setActiveTool('pdf')
      
      const response = await fetch('/api/tools/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content: 'Current conversation content',
          conversationId: Date.now().toString(),
          includeContext: true
        })
      })
      
      const result = await response.json()
      onToolResult({
        tool: 'pdf',
        ...result
      })
      
    } catch (error) {
      console.error('PDF error:', error)
      onToolResult({
        tool: 'pdf',
        error: 'Failed to process PDF'
      })
    } finally {
      setLoading(false)
      setActiveTool(null)
    }
  }

  const handleVoiceInput = async () => {
    try {
      if (recording) {
        // Stop recording
        mediaRecorderRef.current?.stop()
        setRecording(false)
        return
      }
      
      setRecording(true)
      setActiveTool('voice')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = async () => {
          onToolResult({
            tool: 'voice',
            audio: reader.result,
            duration: chunks.length,
            message: 'Voice input captured successfully'
          })
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(track => track.stop())
        setActiveTool(null)
      }
      
      mediaRecorder.start()
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
          setRecording(false)
        }
      }, 10000)
      
    } catch (error) {
      console.error('Voice input error:', error)
      onToolResult({
        tool: 'voice',
        error: 'Failed to access microphone'
      })
      setRecording(false)
      setActiveTool(null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      setLoading(true)
      setActiveTool('file')
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        onToolResult({
          tool: 'file-upload',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          content: reader.result,
          message: `File "${file.name}" uploaded successfully`
        })
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('File upload error:', error)
      onToolResult({
        tool: 'file-upload',
        error: 'Failed to upload file'
      })
    } finally {
      setLoading(false)
      setActiveTool(null)
    }
  }

  const handleURLScrape = async () => {
    try {
      setLoading(true)
      setActiveTool('url')
      
      const url = prompt('Enter URL to analyze:')
      if (!url) return
      
      const response = await fetch('/api/tools/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const result = await response.json()
      onToolResult({
        tool: 'url-scraper',
        ...result
      })
      
    } catch (error) {
      console.error('URL scrape error:', error)
      onToolResult({
        tool: 'url-scraper',
        error: 'Failed to scrape URL'
      })
    } finally {
      setLoading(false)
      setActiveTool(null)
    }
  }

  const tools: Tool[] = [
    {
      id: 'webcam',
      name: 'Webcam',
      description: 'Capture and analyze images',
      icon: Camera,
      color: 'text-blue-500',
      action: handleWebcam
    },
    {
      id: 'screen',
      name: 'Screen Share',
      description: 'Share and analyze screen',
      icon: Monitor,
      color: 'text-green-500',
      action: handleScreenShare
    },
    {
      id: 'pdf',
      name: 'PDF Maker',
      description: 'Create PDF from conversation',
      icon: FileText,
      color: 'text-purple-500',
      action: () => handlePDF('create')
    },
    {
      id: 'voice',
      name: 'Voice Input',
      description: 'Speak your message',
      icon: Mic,
      color: 'text-red-500',
      action: handleVoiceInput
    },
    {
      id: 'file',
      name: 'File Upload',
      description: 'Upload and analyze files',
      icon: Upload,
      color: 'text-orange-500',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'url',
      name: 'URL Scraper',
      description: 'Analyze web pages',
      icon: Globe,
      color: 'text-cyan-500',
      action: handleURLScrape
    }
  ]

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Advanced Tools</CardTitle>
        <CardDescription className="text-xs">
          Enhance your conversation with powerful features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'default' : 'outline'}
              size="sm"
              className="justify-start gap-2 h-auto py-2"
              onClick={tool.action}
              disabled={loading && activeTool !== tool.id}
            >
              {loading && activeTool === tool.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <tool.icon className={cn('h-4 w-4', tool.color)} />
              )}
              <div className="text-left">
                <div className="text-xs font-medium">{tool.name}</div>
                <div className="text-xs text-muted-foreground">
                  {tool.description}
                </div>
              </div>
              {tool.id === 'voice' && recording && (
                <span className="ml-auto h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="*"
        />

        {/* Live Streaming Section */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Live Streaming</div>
          <LiveStreamingTools 
            conversationId={Date.now().toString()}
            onStreamUpdate={onToolResult}
          />
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
          <div className="flex flex-wrap gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handlePDF('summarize')}
            >
              <Brain className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onToolResult({ tool: 'reasoning', message: 'AI thinking visualization enabled' })}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Reasoning
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onToolResult({ tool: 'search', message: 'Search backend connected' })}
            >
              <Search className="h-3 w-3 mr-1" />
              Search
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onToolResult({ tool: 'consultation', message: 'Planning workflow started' })}
            >
              <Calculator className="h-3 w-3 mr-1" />
              Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}