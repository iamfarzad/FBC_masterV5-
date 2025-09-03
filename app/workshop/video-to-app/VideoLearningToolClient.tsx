'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageShell, PageHeader } from '@/components/page-shell'
import { ArrowLeft, Maximize2, Minimize2, Play, Sparkles, Wand2, Video, Code, BookOpen, HelpCircle } from 'lucide-react'
// VideoToApp components temporarily disabled during refactor
import { cn } from '@/lib/utils'

interface VideoLearningToolClientProps {
  initialVideoUrl: string
  sessionId: string
  fromChat: boolean
  mode?: 'workshop' | 'standalone'
}

export function VideoLearningToolClient({
  initialVideoUrl,
  sessionId,
  fromChat,
  mode = 'workshop',
}: VideoLearningToolClientProps) {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl)
  const [generatedApps, setGeneratedApps] = useState<Array<{
    id: string
    url: string
    timestamp: Date
    videoUrl: string
  }>>([])

  useEffect(() => {
    // Load any saved state from session storage if coming from chat
    if (fromChat && sessionId) {
      const savedState = sessionStorage.getItem(`video2app_${sessionId}`)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          if (parsed.generatedApps) {
            setGeneratedApps(parsed.generatedApps)
          }
        } catch (e) {
          console.warn('Failed to parse saved state:', e)
        }
      }
    }
  }, [fromChat, sessionId])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleBackToChat = () => {
    if (fromChat) {
      router.push('/chat')
    } else {
      router.back()
    }
  }

  const handleAppGenerated = (appUrl: string, videoUrl: string) => {
    const newApp = {
      id: Math.random().toString(36).substring(7),
      url: appUrl,
      timestamp: new Date(),
      videoUrl,
    }

    setGeneratedApps(prev => [newApp, ...prev])

    // Save to session storage for chat integration
    if (sessionId) {
      const stateToSave = {
        generatedApps: [newApp, ...generatedApps],
        currentVideoUrl,
      }
      sessionStorage.setItem(`video2app_${sessionId}`, JSON.stringify(stateToSave))
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex h-full flex-col">
          {/* Minimal Header for Fullscreen */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h1 className="text-xl font-semibold text-foreground">Video to Learning App Generator</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-muted-foreground hover:text-foreground"
              >
                <Minimize2 className="mr-2 size-4" />
                Exit Fullscreen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 size-4" />
                {fromChat ? 'Back to Chat' : 'Back'}
              </Button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 p-4">
            {/* VideoToApp fullscreen temporarily disabled */}
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">VideoToApp feature temporarily unavailable</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="glass-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToChat}
            >
              <ArrowLeft className="mr-2 size-4" />
              {fromChat ? 'Back to Chat' : 'Back'}
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                <Video className="mr-3 inline-block size-8 text-brand" />
                Video to Learning App Workshop
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                Transform YouTube videos into interactive learning experiences with AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="mr-2 size-4" />
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="hidden md:flex"
            >
              <Maximize2 className="mr-2 size-4" />
              Fullscreen
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <PageShell className="py-6 md:py-8">
        <div className="space-y-6">
          {/* Workshop Introduction */}
          {mode === 'workshop' && (
            <Card variant="elevated" className="border-l-4 border-l-brand">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-brand/10 rounded-full p-3">
                    <BookOpen className="size-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      F.B/c Video-to-App Workshop
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Transform educational videos into powerful learning applications. Our AI analyzes
                      video content, extracts key concepts, and generates interactive apps with quizzes,
                      flashcards, and personalized learning experiences tailored to your needs.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-success/10 rounded-full px-3 py-1 text-sm text-success">
                        AI-Powered Analysis
                      </span>
                      <span className="bg-info/10 rounded-full px-3 py-1 text-sm text-info">
                        Interactive Learning
                      </span>
                      <span className="bg-warning/10 rounded-full px-3 py-1 text-sm text-warning">
                        Custom Apps
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Video to App Interface */}
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-8">
              <VideoToApp
                mode="workshop"
                videoUrl={currentVideoUrl}
                onVideoUrlChange={setCurrentVideoUrl}
                onAppGenerated={handleAppGenerated}
                className="min-h-[600px]"
              />
            </CardContent>
          </Card>

          {/* Generated Apps Gallery */}
          {generatedApps.length > 0 && (
            <Card variant="elevated">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Sparkles className="size-5 text-brand" />
                  Your Generated Apps
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generatedApps.map((app) => (
                    <Card key={app.id} className="overflow-hidden transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-3 aspect-video overflow-hidden rounded bg-surface-elevated">
                          <iframe
                            src={app.url}
                            className="size-full border-0"
                            title="Generated Learning App"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="truncate text-sm text-muted-foreground">
                            {app.videoUrl}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.timestamp.toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(app.url, '_blank')}
                            >
                              <Play className="mr-1 size-3" />
                              Open
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard?.writeText(app.url)
                              }}
                            >
                              <Code className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageShell>

      {/* Help Modal */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="size-5 text-brand" />
              Video-to-App Help & Documentation
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-lg font-semibold">Video-to-App Feature</h3>
            <p className="text-muted-foreground">
              This feature converts YouTube videos into interactive app blueprints using AI analysis.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Fullscreen Button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={toggleFullscreen}
          size="lg"
          className="rounded-full shadow-xl"
        >
          <Maximize2 className="size-5" />
        </Button>
      </div>
    </>
  )
}
