"use client"

import * as React from "react"
import { useCallback, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "@/src/core/icon-mapping"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FbcVoiceOrb } from "@/components/ui/fbc-voice-orb"
import { useUnifiedMedia } from '@/hooks'

export interface VoiceOverlayProps {
  open: boolean
  onCancel: () => void
  onAccept: (transcript: string, audioData?: string, duration?: number) => void
  sessionId?: string | null
  activeModalities?: {
    voice: boolean
    webcam: boolean
    screen: boolean
  }
}

export function VoiceOverlay({
  open,
  onCancel,
  onAccept,
  activeModalities = { voice: false, webcam: false, screen: false }
}: VoiceOverlayProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null)
  const [collectedAudioData, setCollectedAudioData] = React.useState<string[]>([])
  const [recordingStartTime, setRecordingStartTime] = React.useState<number | null>(null)

  const {
    session,
    isConnected,
    transcript,
    usageMetadata,
    error: websocketError,
    startSession,
    stopSession,
    onAudioChunk,
    onTurnComplete,
  } = useUnifiedMedia({ type: 'voice' })

  const voiceMedia = useUnifiedMedia({
    type: 'voice',
    onCapture: (blob) => {
      // Handle voice capture
      console.log('Voice captured:', blob)
    },
    onError: (error) => {
      console.error('Voice error:', error)
    }
  })

  useEffect(() => {
    if (!open) return
    void (async () => {
      if (!voiceMedia.hasPermission) {
        try { await voiceMedia.requestPermission() } catch {}
      }
    })()
    return () => {
      try { voiceMedia.stopRecording() } catch {}
      // Reset collected data when overlay closes
      setCollectedAudioData([])
      setRecordingStartTime(null)
    }
  }, [open, voiceMedia.hasPermission, voiceMedia.requestPermission, voiceMedia.stopRecording])

  // Auto-start voice session when overlay opens
  useEffect(() => {
    if (open && !voiceMedia.isRecording) {
      const startVoice = async () => {
        const ok = await voiceMedia.requestPermission()
        if (!ok) return

        // Track recording start time
        setRecordingStartTime(Date.now())
        setCollectedAudioData([]) // Reset collected data

        await voiceMedia.startRecording()
        if (!isConnected || !session?.isActive) {
          try {
            await startSession()
          } catch {
            // Error starting session - continue
          }
        }
      }
      void startVoice()
    }
  }, [open, voiceMedia.isRecording, voiceMedia.requestPermission, voiceMedia.startRecording, isConnected, session?.isActive, startSession])

  const handleToggle = useCallback(async () => {
    if (voiceMedia.isRecording) {
      // Pause/Resume functionality for Gemini Live API
      voiceMedia.stopRecording()
      onTurnComplete()
    } else {
      // Resume recording
      await voiceMedia.startRecording()
    }
  }, [voiceMedia.isRecording, voiceMedia.stopRecording, onTurnComplete, voiceMedia.startRecording])

  const handleAccept = useCallback(() => {
    if (!transcript) return

    // Calculate duration
    const duration = recordingStartTime
      ? (Date.now() - recordingStartTime) / 1000 // Convert to seconds
      : 0

    // Combine all collected audio chunks
    const combinedAudioData = collectedAudioData.length > 0
      ? collectedAudioData.join('')
      : undefined

    console.log('Accepting voice input:', {
      transcript,
      audioChunks: collectedAudioData.length,
      duration,
      hasAudioData: !!combinedAudioData
    })

    // Pass all data to parent
    onAccept(transcript, combinedAudioData, duration)

    // Reset state
    setCollectedAudioData([])
    setRecordingStartTime(null)
  }, [transcript, collectedAudioData, recordingStartTime, onAccept])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="glass-card-dark fixed inset-0 z-[70] flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Enhanced Status Badge */}
          <motion.div
            className="glass absolute right-6 top-6 flex items-center gap-2 rounded-xl px-4 py-2 text-xs shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.span
              className={`size-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'}`}
              animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
            />
            <span className="font-medium text-text">
              {isConnected
                ? (voiceMedia.isRecording ? 'Listening...' : 'Ready')
                : 'Connecting...'
              }
            </span>
          </motion.div>

          {/* Orb */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FbcVoiceOrb
                  size="lg"
                  isRecording={voiceMedia.isRecording}
                  onClick={() => void handleToggle()}
                  className="cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                {voiceMedia.isRecording ? 'Pause conversation' : 'Resume conversation'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Accept & Cancel */}
          <div className="mt-6 flex gap-4">
            {/* Accept Button - Only show if we have a transcript */}
            {transcript && (
              <Button
                variant="default"
                size="icon"
                className="rounded-full bg-green-600 hover:bg-green-700"
                onClick={handleAccept}
                title="Send voice message"
              >
                Send
              </Button>
            )}

            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={() => { try { voiceMedia.stopRecording() } catch {} stopSession(); onCancel() }}
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Live Conversation Status */}
          <div className="mt-6 w-full max-w-md">
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full bg-orange-400"
                animate={{ width: `${Math.min(100, Math.round((voiceMedia.volume || 0) * 100))}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Status Display */}
            <div className="h-32 overflow-auto rounded-lg border border-white/20 bg-black/30 p-4 text-sm text-white">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`size-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-xs">
                    {isConnected
                      ? `Gemini Live ${voiceMedia.isRecording ? 'Active' : 'Ready'}`
                      : 'Connecting to Gemini Live API...'
                    }
                  </span>
                </div>

                {/* Multimodal Status Indicators */}
                {(activeModalities.webcam || activeModality.screen) && (
                  <div className="mt-1 flex items-center gap-2">
                    {activeModality.webcam && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <div className="size-1.5 rounded-full bg-blue-400" />
                        <span>Camera</span>
                      </div>
                    )}
                    {activeModality.screen && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <div className="size-1.5 rounded-full bg-green-400" />
                        <span>Screen</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Duration Warning */}
                {isConnected && (
                  <div className="mt-1 text-xs text-white/50">
                    Session: Audio-only (15min) • Audio+Video (2min)
                  </div>
                )}

                <div className="text-center">
                  {voiceMedia.isRecording ? (
                    <div className="space-y-1">
                      <div className="font-medium text-orange-400">Listening...</div>
                      <div className="text-xs text-white/70">AI can see, hear, and respond</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-medium text-white/60">Paused</div>
                      <div className="text-xs text-white/70">Tap orb to resume conversation</div>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="mt-3 rounded bg-white/10 p-2 text-xs">
                    <div className="mb-1 text-white/70">Latest:</div>
                    <div className="text-white">{transcript}</div>
                  </div>
                )}

                {/* Token Usage Display */}
                {usageMetadata && (
                  <div className="mt-3 rounded bg-white/10 p-2 text-xs">
                    <div className="mb-1 text-white/70">Usage:</div>
                    <div className="text-white">
                      {usageMetadata.totalTokenCount} tokens
                      {usageMetadata.responseTokensDetails.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {usageMetadata.responseTokensDetails.map((detail, idx) => (
                            <div key={idx} className="text-white/60">
                              {detail.modality}: {detail.tokenCount}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(websocketError || voiceMedia.error) && (
              <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-2 text-xs text-red-300 backdrop-blur-sm">
                {websocketError || voiceMedia.error}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceOverlay