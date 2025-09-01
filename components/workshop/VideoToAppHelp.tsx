'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Video,
  Sparkles,
  Play,
  Download,
  Share,
  HelpCircle,
  Youtube,
  Zap,
  Eye,
  Code,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/src/core/utils'

interface VideoToAppHelpProps {
  className?: string
  compact?: boolean
}

export function VideoToAppHelp({ className, compact = false }: VideoToAppHelpProps) {
  const steps = [
    {
      icon: <Youtube className="w-5 h-5" />,
      title: "Paste YouTube URL",
      description: "Share any YouTube video link in chat or workshop",
      example: "https://youtu.be/dQw4w9WgXcQ"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Analyzes Content",
      description: "Our AI extracts key concepts and learning objectives",
      detail: "Analyzes transcript, identifies topics, creates structure"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Generates App",
      description: "Creates interactive learning application automatically",
      detail: "Builds quizzes, flashcards, interactive elements"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Preview & Edit",
      description: "See your app instantly and customize as needed",
      detail: "Live preview with full editing capabilities"
    }
  ]

  const features = [
    {
      icon: <Play className="w-4 h-4" />,
      title: "Live Preview",
      description: "See your app instantly in the browser"
    },
    {
      icon: <Download className="w-4 h-4" />,
      title: "Download HTML",
      description: "Get self-contained web application"
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Copy Code",
      description: "Raw HTML/CSS/JS for integration"
    },
    {
      icon: <Share className="w-4 h-4" />,
      title: "Share Link",
      description: "Direct access URL for your app"
    }
  ]

  if (compact) {
    return (
      <Card className={cn("border-brand/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10">
              <HelpCircle className="w-4 h-4 text-brand" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                How Video-to-App Works
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Transform YouTube videos into interactive learning apps with AI
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Youtube className="w-3 h-3 text-red-500" />
                  <span>Paste YouTube URL</span>
                  <ArrowRight className="w-3 h-3" />
                  <Sparkles className="w-3 h-3 text-brand" />
                  <span>AI generates app</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand/10 flex items-center justify-center">
          <Video className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Video-to-Learning App
        </h2>
        <p className="text-muted-foreground">
          Transform YouTube videos into interactive learning experiences
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-brand" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated/50">
                <div className="p-2 rounded-lg bg-brand/10 text-brand">
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-muted-foreground mt-1 opacity-75">
                      {step.detail}
                    </p>
                  )}
                  {step.example && (
                    <code className="text-xs bg-surface-elevated px-2 py-1 rounded mt-2 block">
                      {step.example}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-brand" />
            Features & Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-surface-elevated/30">
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                  {feature.icon}
                </div>
                <h5 className="font-semibold text-sm text-foreground">
                  {feature.title}
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported YouTube Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">✅</Badge>
              <code className="text-xs">https://www.youtube.com/watch?v=VIDEO_ID</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">✅</Badge>
              <code className="text-xs">https://youtu.be/VIDEO_ID</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">✅</Badge>
              <code className="text-xs">https://youtube.com/embed/VIDEO_ID</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="text-xs">✅</Badge>
              <code className="text-xs">https://youtube.com/shorts/VIDEO_ID</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-brand/20 bg-brand/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10">
              <HelpCircle className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Pro Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear, educational videos for best results</li>
                <li>• Add custom learning objectives for focused content</li>
                <li>• Generated apps work offline once downloaded</li>
                <li>• Share links work on any device with a browser</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VideoToAppHelp
