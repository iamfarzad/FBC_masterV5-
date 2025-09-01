"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Bot, Play, Pause, Square, RotateCcw, TrendingUp, FileSearch, Brain } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface VideoToAppCardProps {
  videoToAppCard: any
  messageId: string
  onStartAnalysis: (messageId: string, videoUrl: string) => void
}

export function VideoToAppCard({ videoToAppCard, messageId, onStartAnalysis }: VideoToAppCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartAnalysis = useCallback(() => {
    onStartAnalysis(messageId, videoToAppCard.videoUrl)
  }, [messageId, videoToAppCard.videoUrl, onStartAnalysis])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing':
        return <Brain className="w-4 h-4 animate-pulse" />
      case 'generating':
        return <FileSearch className="w-4 h-4 animate-pulse" />
      case 'completed':
        return <TrendingUp className="w-4 h-4" />
      case 'error':
        return <Square className="w-4 h-4" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'generating':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
      <div className="bg-surface rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header with video preview */}
        <div className="p-4 bg-surface-elevated/50 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground truncate">
                  Video-to-App Analysis
                </h4>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", getStatusColor(videoToAppCard.status))}
                >
                  {getStatusIcon(videoToAppCard.status)}
                  <span className="ml-1 capitalize">{videoToAppCard.status}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {videoToAppCard.videoUrl}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>

          {/* Progress bar */}
          {videoToAppCard.progress !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Analysis Progress</span>
                <span>{videoToAppCard.progress}%</span>
              </div>
              <Progress value={videoToAppCard.progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {videoToAppCard.status === 'pending' && (
                  <Button
                    onClick={handleStartAnalysis}
                    className="bg-brand hover:bg-brand/90"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>
                )}

                {videoToAppCard.status === 'analyzing' && (
                  <Button
                    disabled
                    className="bg-blue-500"
                    size="sm"
                  >
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </Button>
                )}

                {videoToAppCard.status === 'generating' && (
                  <Button
                    disabled
                    className="bg-purple-500"
                    size="sm"
                  >
                    <FileSearch className="w-4 h-4 mr-2 animate-pulse" />
                    Generating...
                  </Button>
                )}

                {videoToAppCard.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/workshop/video-to-app'}
                    >
                      Open Workshop
                    </Button>
                  </div>
                )}

                {videoToAppCard.status === 'error' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartAnalysis}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {videoToAppCard.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{videoToAppCard.error}</p>
                </div>
              )}

              {/* Generated content preview */}
              {videoToAppCard.spec && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-foreground">Generated Specification:</h5>
                  <div className="p-3 bg-muted rounded-lg">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {videoToAppCard.spec}
                    </pre>
                  </div>
                </div>
              )}

              {/* Generated code preview */}
              {videoToAppCard.code && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-foreground">Generated Code:</h5>
                  <div className="p-3 bg-muted rounded-lg">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                      {videoToAppCard.code}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
