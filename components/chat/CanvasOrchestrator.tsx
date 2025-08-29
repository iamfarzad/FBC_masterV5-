'use client'

import React, { useMemo, useEffect } from 'react'
import { CanvasWorkspace } from '@/components/chat/CanvasWorkspace'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
// VideoToApp moved to dedicated workshop page - redirect users there
// import { VideoToApp } from '@/components/chat/tools/VideoToApp/VideoToApp'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { useCanvas } from '@/components/providers/canvas-provider'

const TITLES: Record<string, string> = {
  webcam: 'Webcam',
  screen: 'Screen Share',
  video: 'Video to App',
  pdf: 'Document',
  code: 'Code',
  webpreview: 'Preview',
}

interface CanvasOrchestratorProps {
  onClose?: () => void
}

export function CanvasOrchestrator({ onClose }: CanvasOrchestratorProps = {}) {
  const { canvas, closeCanvas } = useCanvas()
  const { type, props } = canvas

  // Use provided onClose or fallback to canvas close
  const handleClose = onClose || closeCanvas

  const content = useMemo(() => {
    switch (type) {
      case 'webcam':
        return (
          <div className="h-full w-full">
            <WebcamCapture mode="canvas" onClose={handleClose} onAIAnalysis={() => {}} />
          </div>
        )
      case 'screen':
        return (
          <div className="h-full w-full">
            <ScreenShare mode="canvas" onClose={handleClose} />
          </div>
        )
      case 'video':
        // Redirect to dedicated workshop page
        if (typeof window !== 'undefined') {
          const videoUrl = (props?.videoUrl as string) || ''
          const workshopUrl = videoUrl
            ? `/workshop/video-to-app?url=${encodeURIComponent(videoUrl)}`
            : '/workshop/video-to-app'
          window.location.href = workshopUrl
        }

        return (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Redirecting to Workshop</h3>
              <p className="text-muted-foreground">
                Opening Video-to-App Workshop in a new page for better experience...
              </p>
            </div>
          </div>
        )
      case 'pdf':
        return (
          <div className="h-full p-3">
            <iframe className="h-full w-full rounded border" src={(props?.url as string) || ''} />
          </div>
        )
      case 'code':
        return (
          <div className="h-full p-3 overflow-auto">
            <CodeBlock code={(props?.code as string) || ''} language={(props?.lang as string) || 'tsx'} />
          </div>
        )
      case 'webpreview':
        return props?.children as React.ReactNode
      default:
        return null
    }
  }, [type, props, handleClose])

  if (!type) return null

  return (
    <CanvasWorkspace
      open={!!type}
      title={TITLES[type] ?? 'Canvas'}
      onClose={handleClose}
      left={props?.left as React.ReactNode}
      consoleArea={props?.console as React.ReactNode}
      compact
    >
      {content}
    </CanvasWorkspace>
  )
}


