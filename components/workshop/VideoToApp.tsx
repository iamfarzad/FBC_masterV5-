'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Youtube, Sparkles, AlertCircle } from 'lucide-react'

export function VideoToApp() {
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const processVideo = async () => {
    const videoId = extractVideoId(url)
    
    if (!videoId) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setIsProcessing(true)
    setError('')
    
    try {
      const response = await fetch('/api/tools/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, videoId })
      })

      if (!response.ok) {
        throw new Error('Failed to process video')
      }

      const data = await response.json()
      setResult(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5" />
          Video to App Generator
        </CardTitle>
        <CardDescription>
          Transform YouTube videos into interactive learning applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube URL</label>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={processVideo}
          disabled={!url || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Video...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate App
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Video Analysis</h3>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p><strong>Title:</strong> {result.title || 'Processing...'}</p>
                <p><strong>Duration:</strong> {result.duration || 'Unknown'}</p>
                <p><strong>Topics:</strong> {result.topics?.join(', ') || 'Analyzing...'}</p>
              </div>
            </div>

            {result.transcript && (
              <div>
                <h3 className="font-medium mb-2">Key Points</h3>
                <Textarea
                  value={result.keyPoints || 'Extracting key points...'}
                  readOnly
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {result.appStructure && (
              <div>
                <h3 className="font-medium mb-2">Generated App Structure</h3>
                <div className="rounded-lg bg-muted p-4">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(result.appStructure, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Preview App
              </Button>
              <Button className="flex-1">
                Deploy App
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}