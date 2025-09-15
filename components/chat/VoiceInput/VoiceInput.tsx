"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { VoiceInputProps } from "./VoiceInput.types"

export function VoiceInput({ 
  mode = 'card', 
  onTranscript, 
  onClose, 
  onCancel,
  leadContext,
  className 
}: VoiceInputProps) {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  const handleTranscript = useCallback((text: string) => {
    setIsProcessing(true)
    try {
      if (mode === 'modal') {
        onTranscript(text)
        onClose?.()
      } else {
        onTranscript(text)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [mode, onTranscript, onClose])

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript)
          }
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
          if (transcript) {
            handleTranscript(transcript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          toast({
            title: "Voice Recognition Error",
            description: "Could not process voice input. Please try again.",
            variant: "destructive"
          })
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [transcript, toast, handleTranscript])

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("")
      setIsRecording(true)
      recognitionRef.current.start()
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }


  const handleCancel = () => {
    stopRecording()
    setTranscript("")
    if (mode === 'modal') {
      onClose?.()
    } else {
      onCancel?.()
    }
  }

  const VoiceInputUI = () => (
    <div className={`flex flex-col items-center gap-4 p-6 ${className || ''}`}>
      {!isRecording && !transcript && (
        <div className="flex flex-col items-center gap-4">
          <Mic className="size-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">Click to start voice input</p>
          <Button onClick={startRecording} className="w-full">
            <Mic className="mr-2 size-4" />
            Start Recording
          </Button>
        </div>
      )}
      
      {isRecording && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex size-16 animate-pulse items-center justify-center rounded-full bg-red-500">
              <Mic className="size-8 text-white" />
            </div>
            <div className="absolute inset-0 size-16 animate-ping rounded-full border-4 border-red-500" />
          </div>
          <p className="font-medium text-red-500">Recording... Speak now</p>
          <Button variant="outline" onClick={stopRecording}>
            <Square className="mr-2 size-4" />
            Stop Recording
          </Button>
        </div>
      )}

      {transcript && !isRecording && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm text-muted-foreground">Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </div>
          <div className="flex w-full gap-2">
            <Button onClick={() => handleTranscript(transcript)} className="flex-1">
              Use This Text
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-muted-foreground">Processing...</p>
        </div>
      )}
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog
        open={true}
        onOpenChange={(open) => { if (!open) onClose?.(); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-semibold">Voice Input</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </DialogHeader>
          
          <VoiceInputUI />
        </DialogContent>
      </Dialog>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper
      title="Voice Input"
      description="Use your voice to input text"
    >
      <VoiceInputUI />
    </ToolCardWrapper>
  )
}
