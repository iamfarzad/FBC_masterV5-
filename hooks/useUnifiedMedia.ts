
import { useState, useCallback, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export type MediaType = 'voice' | 'webcam' | 'screen'
export type MediaState = 'idle' | 'initializing' | 'active' | 'recording' | 'paused' | 'captured' | 'error' | 'permission-denied'

interface MediaConstraints {
  audio?: MediaTrackConstraints | boolean
  video?: MediaTrackConstraints | boolean
  screen?: boolean
}

interface UseUnifiedMediaProps {
  type: MediaType
  constraints?: MediaConstraints
  onCapture?: (data: Blob | string) => void
  onStream?: (stream: MediaStream) => void
  onError?: (error: Error) => void
  autoStart?: boolean
  facingMode?: 'user' | 'environment'
}

export function useUnifiedMedia({
  type,
  constraints = {},
  onCapture,
  onStream,
  onError,
  autoStart = false,
  facingMode = 'user'
}: UseUnifiedMediaProps) {
  const { toast } = useToast()
  const [state, setState] = useState<MediaState>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedData, setCapturedData] = useState<Blob | string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Unified constraints builder
  const getMediaConstraints = useCallback((): MediaStreamConstraints => {
    const baseConstraints = { ...constraints }
    
    switch (type) {
      case 'voice':
        return {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...baseConstraints.audio as MediaTrackConstraints
          },
          video: false
        }
      case 'webcam':
        return {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode,
            ...baseConstraints.video as MediaTrackConstraints
          },
          audio: baseConstraints.audio || false
        }
      case 'screen':
        return {
          video: true,
          audio: baseConstraints.audio || false
        }
      default:
        return baseConstraints
    }
  }, [type, constraints, facingMode])

  // Start timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setElapsedTime(0)
    
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsedTime(elapsed)
      }
    }, 1000)
  }, [])

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
    startTimeRef.current = undefined
  }, [])

  // Cleanup stream
  const cleanupStream = useCallback((mediaStream: MediaStream) => {
    mediaStream.getTracks().forEach(track => {
      track.stop()
      mediaStream.removeTrack(track)
    })
  }, [])

  // Start media capture
  const startCapture = useCallback(async () => {
    try {
      setState('initializing')
      setError(null)
      
      // Stop existing stream
      if (stream) {
        cleanupStream(stream)
      }

      let mediaStream: MediaStream

      // Get media stream based on type
      if (type === 'screen') {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always', displaySurface: 'monitor' },
          audio: constraints.audio || false
        } as DisplayMediaStreamOptions)
      } else {
        mediaStream = await navigator.mediaDevices.getUserMedia(getMediaConstraints())
      }

      setStream(mediaStream)
      
      // Setup video element
      if (videoRef.current && (type === 'webcam' || type === 'screen')) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(console.error)
      }

      // Setup screen share end handler
      if (type === 'screen') {
        const videoTrack = mediaStream.getVideoTracks()[0]
        videoTrack.onended = () => stopCapture()
      }

      // Setup media recorder for voice recording
      if (type === 'voice') {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
        
        const recorder = new MediaRecorder(mediaStream, { mimeType })
        mediaRecorderRef.current = recorder
        chunksRef.current = []

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          setCapturedData(blob)
          onCapture?.(blob)
          setState('captured')
        }

        recorder.start(100)
        startTimer()
        setState('recording')
      } else {
        setState('active')
      }

      onStream?.(mediaStream)
      
    } catch (err: any) {
      const errorState = err.name === 'NotAllowedError' ? 'permission-denied' : 'error'
      const errorMessage = errorState === 'permission-denied'
        ? 'Media access was denied. Please allow access to use this feature.'
        : `Failed to access ${type}. Please check your device connection.`
      
      setError(errorMessage)
      setState(errorState)
      onError?.(new Error(errorMessage))
      
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Error`,
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }, [type, constraints, stream, cleanupStream, getMediaConstraints, onStream, onCapture, onError, toast, startTimer])

  // Stop capture
  const stopCapture = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (stream) {
      cleanupStream(stream)
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    stopTimer()
    setState('idle')
  }, [stream, cleanupStream, stopTimer])

  // Capture photo/screenshot
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || type === 'voice') return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return null
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageUrl = canvas.toDataURL('image/png')
    setCapturedData(imageUrl)
    setState('captured')
    onCapture?.(imageUrl)
    
    return imageUrl
  }, [type, onCapture])

  // Toggle capture
  const toggleCapture = useCallback(() => {
    if (state === 'active' || state === 'recording') {
      stopCapture()
    } else {
      startCapture()
    }
  }, [state, startCapture, stopCapture])

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      startCapture()
    }
    
    return () => {
      stopTimer()
      if (stream) {
        cleanupStream(stream)
      }
    }
  }, [autoStart])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      if (stream) {
        cleanupStream(stream)
      }
    }
  }, [stream, cleanupStream, stopTimer])

  return {
    // State
    state,
    stream,
    capturedData,
    error,
    elapsedTime,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Actions
    startCapture,
    stopCapture,
    capturePhoto,
    toggleCapture,
    
    // State helpers
    isIdle: state === 'idle',
    isActive: state === 'active' || state === 'recording',
    isRecording: state === 'recording',
    hasError: state === 'error' || state === 'permission-denied',
    hasCaptured: state === 'captured',
    isInitializing: state === 'initializing'
  }
}
