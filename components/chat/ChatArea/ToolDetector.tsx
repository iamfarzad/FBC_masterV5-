"use client"

import React, { useCallback } from 'react'
import { FileText } from 'lucide-react'
import type { ROICalculationResult } from '@/components/chat/tools/ROICalculator/ROICalculator.types'

interface ToolDetectorProps {
  content: string
  messageId: string
  onVoiceTranscript: (transcript: string) => void
  onWebcamCapture: (imageData: string) => void
  onROICalculation: (result: ROICalculationResult) => void
  onScreenAnalysis: (analysis: string) => void
}

export function detectToolType(content: string): string | null {
  if (!content) return null
  if (content.includes('VOICE_INPUT')) return 'voice_input'
  if (content.includes('WEBCAM_CAPTURE')) return 'webcam_capture'
  if (content.includes('ROI_CALCULATOR')) return 'roi_calculator'
  if (content.includes('VIDEO_TO_APP')) return 'video_to_app'
  if (content.includes('SCREEN_SHARE')) return 'screen_share'
  return null
}

export function detectMessageType(content: string) {
  if (!content) return { type: 'default' }

  if (content.includes('WEBCAM_CAPTURE')) {
    return {
      type: 'image',
      icon: <FileText className="w-3 h-3 mr-1" />,
      badge: 'Image',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  if (content.includes('VOICE_INPUT')) {
    return {
      type: 'voice',
      icon: <FileText className="w-3 h-3 mr-1" />,
      badge: 'Voice',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  }

  if (content.includes('ROI_CALCULATOR')) {
    return {
      type: 'roi',
      icon: <FileText className="w-3 h-3 mr-1" />,
      badge: 'ROI',
      color: 'bg-green-50 text-green-700 border-green-200'
    }
  }

  if (content.length > 300) {
    return {
      type: 'long',
      icon: <FileText className="w-3 h-3 mr-1" />,
      badge: 'Detailed',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return { type: 'default' }
}

export function ToolDetector({
  content,
  messageId,
  onVoiceTranscript,
  onWebcamCapture,
  onROICalculation,
  onScreenAnalysis
}: ToolDetectorProps) {
  const toolType = detectToolType(content)

  const handleCancel = useCallback(() => {
    // Handle tool cancellation
  }, [])

  switch (toolType) {
    case 'voice_input':
      return (
        <div className="mt-3">
          {/* VoiceInput component would be imported and used here */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Voice Input Tool</p>
          </div>
        </div>
      )

    case 'webcam_capture':
      return (
        <div className="mt-3">
          {/* WebcamCapture component would be imported and used here */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Webcam Capture Tool</p>
          </div>
        </div>
      )

    case 'roi_calculator':
      return (
        <div className="mt-3">
          {/* ROICalculator component would be imported and used here */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">ROI Calculator Tool</p>
          </div>
        </div>
      )

    case 'screen_share':
      return (
        <div className="mt-3">
          {/* ScreenShare component would be imported and used here */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Screen Share Tool</p>
          </div>
        </div>
      )

    default:
      return null
  }
}
