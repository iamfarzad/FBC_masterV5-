"use client"

import * as React from "react"
import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "@/src/core/icon-mapping"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FbcVoiceOrb } from "@/components/ui/fbc-voice-orb"
import { useWebSocketVoice } from '@/hooks/use-websocket-voice'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

export interface VoiceOverlayProps {
  open: boolean
  onCancel: () => void
  onAccept: (transcript: string) => void
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
  } = useWebSocketVoice()

  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recorderError,
    volume,
    hasPermission,
    requestPermission,
  } = useVoiceRecorder({ onAudioChunk, onTurnComplete })

  React.useEffect(() => {
    if (!open) return
    void (async () => {
      if (!hasPermission) {
        try { await requestPermission() } catch {}
      }
    })()
    return () => {
      try { stopRecording() } catch {}
    }
  }, [open, hasPermission, requestPermission, stopRecording])

  // Auto-start voice session when overlay opens
  React.useEffect(() => {
    if (open && !isRecording) {
      const startVoice = async () => {
        const ok = await requestPermission()
        if (!ok) return
        await startRecording()
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
  }, [open, isRecording, requestPermission, startRecording, isConnected, session?.isActive, startSession])

  const handleToggle = useCallback(async () => {
    if (isRecording) {
      // Pause/Resume functionality for Gemini Live API
      stopRecording()
      onTurnComplete()
    } else {
      // Resume recording
      await startRecording()
    }
  }, [isRecording, stopRecording, onTurnComplete, startRecording])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[70] glass-card-dark flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Enhanced Status Badge */}
          <motion.div
            className="absolute top-6 right-6 glass text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.span
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'}`}
              animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
            />
            <span className="text-text font-medium">
              {isConnected
                ? (isRecording ? '🎙️ Listening...' : '✨ Ready')
                : '🔄 Connecting...'
              }
            </span>
          </motion.div>

          {/* Orb */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FbcVoiceOrb
                  size="lg"
                  isRecording={isRecording}
                  onClick={() => void handleToggle()}
                  className="cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                {isRecording ? '⏸️ Pause conversation' : '▶️ Resume conversation'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Cancel */}
          <div className="mt-6">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={() => { try { stopRecording() } catch {}; stopSession(); onCancel() }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Live Conversation Status */}
          <div className="w-full max-w-md mt-6">
            <div className="mb-2 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full bg-orange-400"
                animate={{ width: `${Math.min(100, Math.round((volume || 0) * 100))}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Status Display */}
            <div className="h-32 rounded-lg bg-black/30 border border-white/20 p-4 text-sm text-white overflow-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-xs">
                    {isConnected
                      ? `Gemini Live ${isRecording ? 'Active' : 'Ready'}`
                      : 'Connecting to Gemini Live API...'
                    }
                  </span>
                </div>

                {/* Multimodal Status Indicators */}
                {(activeModalities.webcam || activeModalities.screen) && (
                  <div className="flex items-center gap-2 mt-1">
                    {activeModalities.webcam && (
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>📹 Camera</span>
                      </div>
                    )}
                    {activeModalities.screen && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span>🖥️ Screen</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Duration Warning */}
                {isConnected && (
                  <div className="text-xs text-white/50 mt-1">
                    Session: Audio-only (15min) • Audio+Video (2min)
                  </div>
                )}

                <div className="text-center">
                  {isRecording ? (
                    <div className="space-y-1">
                      <div className="text-orange-400 font-medium">🎙️ Listening...</div>
                      <div className="text-xs text-white/70">AI can see, hear, and respond</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-white/60 font-medium">⏸️ Paused</div>
                      <div className="text-xs text-white/70">Tap orb to resume conversation</div>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="mt-3 p-2 bg-white/10 rounded text-xs">
                    <div className="text-white/70 mb-1">Latest:</div>
                    <div className="text-white">{transcript}</div>
                  </div>
                )}

                {/* Token Usage Display */}
                {usageMetadata && (
                  <div className="mt-3 p-2 bg-white/10 rounded text-xs">
                    <div className="text-white/70 mb-1">Usage:</div>
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

            {(websocketError || recorderError) && (
              <div className="mt-2 text-xs text-red-300 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-2">
                {websocketError || recorderError}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceOverlay
