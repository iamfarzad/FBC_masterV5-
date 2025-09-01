"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Link, Code, Play } from 'lucide-react'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { extractVideoInfo } from './VideoToAppConstants'

interface AppPreviewProps {
  videoUrl: string
  generatedAppUrl: string | null
  generatedCode: string | null
  onReset: () => void
}

export function AppPreview({
  videoUrl,
  generatedAppUrl,
  generatedCode,
  onReset
}: AppPreviewProps) {
  const { toast } = useToast()
  const videoInfo = extractVideoInfo(videoUrl)

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard?.writeText(generatedCode)
      toast({
        title: "Copied!",
        description: "HTML code copied to clipboard.",
      })
    }
  }

  return (
    <motion.div
      key="app-preview"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Learning App Generated!
          </h3>
          <p className="text-sm text-muted-foreground">
            Your interactive learning experience is ready
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Create New App
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* App Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="aspect-video bg-surface-elevated rounded-t-lg overflow-hidden">
                {generatedAppUrl && (
                  <iframe
                    src={generatedAppUrl}
                    className="w-full h-full border-0"
                    title="Generated Learning App"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generatedAppUrl && window.open(generatedAppUrl, '_blank')}
                    className="flex-1"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Open Full Screen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Info & Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">App Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="text-foreground truncate max-w-32">
                    {videoInfo.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span className="text-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">
                    {(generatedCode?.length || 0) / 1024}KB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">Features</h4>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  Interactive Elements
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  Mobile Responsive
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  Self-Contained
                </Badge>
                <Badge variant="secondary" className="w-full justify-center">
                  AI-Generated
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-3">Share Options</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Download HTML
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Share Link
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Embed Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
