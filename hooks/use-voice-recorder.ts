import { useState, useRef, useCallback, useEffect } from 'react'
import { webRTCAudioProcessor } from '@/src/core/webrtc-audio-processor'

export interface VoiceRecorderOptions {
  onRecordingComplete?: (audioBlob: Blob) => void
  onError?: (error: Error) => void
  maxDuration?: number // in seconds
}

export function useVoiceRecorder(options: VoiceRecorderOptions = {}) {
  const { onRecordingComplete, onError, maxDuration = 300 } = options
  
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const levelMonitorRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      await webRTCAudioProcessor.initializeAudio()
      webRTCAudioProcessor.startRecording()
      
      setIsRecording(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      
      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingTime(elapsed)
        
        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 1000)
      
      // Start audio level monitoring
      levelMonitorRef.current = setInterval(() => {
        if (!isPaused) {
          const level = webRTCAudioProcessor.getAudioLevel()
          setAudioLevel(level)
        }
      }, 100)
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      onError?.(error as Error)
      setIsRecording(false)
    }
  }, [maxDuration, isPaused, onError])

  const stopRecording = useCallback(async () => {
    if (!isRecording) return
    
    try {
      const audioBlob = await webRTCAudioProcessor.stopRecording()
      
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (levelMonitorRef.current) {
        clearInterval(levelMonitorRef.current)
        levelMonitorRef.current = null
      }
      
      setIsRecording(false)
      setIsPaused(false)
      setRecordingTime(0)
      setAudioLevel(0)
      
      // Cleanup audio resources
      webRTCAudioProcessor.cleanup()
      
      onRecordingComplete?.(audioBlob)
      
    } catch (error) {
      console.error('Failed to stop recording:', error)
      onError?.(error as Error)
    }
  }, [isRecording, onRecordingComplete, onError])

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      setIsPaused(true)
      // Note: MediaRecorder doesn't support true pause/resume
      // This is a UI-only pause
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      setIsPaused(false)
    }
  }, [isRecording, isPaused])

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (levelMonitorRef.current) {
      clearInterval(levelMonitorRef.current)
      levelMonitorRef.current = null
    }
    
    webRTCAudioProcessor.cleanup()
    
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioLevel(0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (levelMonitorRef.current) clearInterval(levelMonitorRef.current)
      webRTCAudioProcessor.cleanup()
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRecording,
    isPaused,
    recordingTime,
    formattedTime: formatTime(recordingTime),
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    isSupported: typeof window !== 'undefined' && 'MediaRecorder' in window
  }
}