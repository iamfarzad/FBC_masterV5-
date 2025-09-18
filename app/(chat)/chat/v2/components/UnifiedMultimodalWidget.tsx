"use client"

import React from 'react'
import { Mic, Camera, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUnifiedChatMessages } from '@/src/core/chat/state/unified-chat-store'
import type { UnifiedMessage as UnifiedChatMessageType } from '@/src/core/chat/unified-types'
import { StageRailCard } from '@/components/collab/StageRail'
import { Badge } from '@/components/ui/badge'

export const SpeechToSpeechPopover = ({ isOpen, onClose, onVoiceComplete }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Voice Input</h2>
        <p className="text-text-muted">Voice recording - AI SDK Tools integration</p>
        <Button onClick={() => { onVoiceComplete('Test voice input'); onClose(); }} className="mt-4 mr-2">Complete</Button>
        <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
      </div>
    </div>
  )
}

export const WebcamInterface = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Webcam Interface</h2>
        <p className="text-text-muted">Camera analysis - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  )
}

export const ScreenShareInterface = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Screen Share</h2>
        <p className="text-text-muted">Screen sharing - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  )
}

export interface UnifiedMultimodalWidgetProps {
  onVoiceToggle?: () => void
  onWebcamToggle?: () => void
  onScreenShareToggle?: () => void
}

const formatStatus = (message: UnifiedChatMessageType | null) => {
  if (!message) {
    return { label: 'Idle', tone: 'muted' as const }
  }
  if (message.metadata?.error) {
    return { label: 'Attention', tone: 'destructive' as const }
  }
  return { label: 'Active', tone: 'positive' as const }
}

const formatTimestamp = (timestamp?: Date) => {
  if (!timestamp) return 'Never'
  try {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Recently'
  }
}

export const UnifiedMultimodalWidget = ({
  onVoiceToggle,
  onWebcamToggle,
  onScreenShareToggle,
}: UnifiedMultimodalWidgetProps) => {
  const messages = useUnifiedChatMessages()

  const latestBySource = (source: string) => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const meta = messages[i]?.metadata
      if (meta && meta.source === source) {
        return messages[i]
      }
    }
    return null
  }

  const voiceMessage = latestBySource('voice-input') || latestBySource('voice-test')
  const webcamMessage = latestBySource('webcam-analysis') || latestBySource('webcam-test')
  const screenMessage = latestBySource('screen-analysis') || latestBySource('screen-share')

  const cards = [
    {
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      message: voiceMessage,
      onClick: onVoiceToggle,
    },
    {
      id: 'webcam',
      label: 'Webcam',
      icon: Camera,
      message: webcamMessage,
      onClick: onWebcamToggle,
    },
    {
      id: 'screen',
      label: 'Screen Share',
      icon: Monitor,
      message: screenMessage,
      onClick: onScreenShareToggle,
    },
  ]

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur">
      <div className="md:hidden">
        <StageRailCard />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-text">Multimodal Tools</div>
        <Badge variant="secondary" className="text-xs bg-brand/10 text-brand border-brand/20">
          Gemini Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {cards.map(({ id, label, icon: Icon, message, onClick }) => {
          const status = formatStatus(message)
          const IconStatus = message?.metadata?.error ? AlertTriangle : CheckCircle2
          return (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-surface-elevated/70 p-3 text-left transition hover:border-brand/60 hover:bg-brand/5"
            >
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-text">
                  <Icon className="h-4 w-4 text-brand" />
                  {label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    status.tone === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : status.tone === 'destructive'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-surface border border-border text-text-muted'
                  }`}
                >
                  <IconStatus className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-text-muted">
                {message?.content || 'No recent activity'}
              </p>
              <span className="text-[11px] text-text-muted">
                {message ? formatTimestamp(message.timestamp) : 'Never used'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

