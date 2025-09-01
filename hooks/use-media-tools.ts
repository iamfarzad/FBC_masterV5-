"use client"

import { useCallback, useState, useRef } from 'react'
import { useToolActions } from './use-tool-actions'

export interface MediaCaptureOptions {
  sessionId?: string
  userId?: string
  autoAnalyze?: boolean
}

export function useMediaTools(options: MediaCaptureOptions = {}) {
  const { analyzeWebcam, analyzeScreen, isToolLoading } = useToolActions()
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start webcam capture
  const startWebcam = useCallback(async () => {
    try {
      setIsCapturing(true)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      
      return true
    } catch (error) {
      console.error('Failed to start webcam:', error)
      setIsCapturing(false)
      return false
    }
  }, [])

  // Stop webcam capture
  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
    setCapturedImage(null)
  }, [stream])

  // Capture image from webcam
  const captureWebcamImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error('Video or canvas reference not available')
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Canvas context not available')
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    
    // Auto-analyze if enabled
    if (options.autoAnalyze) {
      const result = await analyzeWebcam(imageData, {
        sessionId: options.sessionId,
        userId: options.userId,
        type: 'webcam'
      })
      return { imageData, analysis: result }
    }
    
    return { imageData }
  }, [analyzeWebcam, options])

  // Capture screen
  const captureScreen = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      })
      
      const video = document.createElement('video')
      video.srcObject = mediaStream
      video.play()
      
      return new Promise<{ imageData: string; analysis?: any }>((resolve, reject) => {
        video.onloadedmetadata = async () => {
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          
          if (!context) {
            reject(new Error('Canvas context not available'))
            return
          }
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0)
          
          const imageData = canvas.toDataURL('image/jpeg', 0.8)
          
          // Stop the stream
          mediaStream.getTracks().forEach(track => track.stop())
          
          // Auto-analyze if enabled
          if (options.autoAnalyze) {
            const result = await analyzeScreen(imageData, {
              sessionId: options.sessionId,
              userId: options.userId,
              type: 'screen'
            })
            resolve({ imageData, analysis: result })
          } else {
            resolve({ imageData })
          }
        }
      })
    } catch (error) {
      console.error('Failed to capture screen:', error)
      throw error
    }
  }, [analyzeScreen, options])

  // Analyze captured image manually
  const analyzeImage = useCallback(async (imageData: string, type: 'webcam' | 'screen' = 'webcam') => {
    if (type === 'webcam') {
      return analyzeWebcam(imageData, {
        sessionId: options.sessionId,
        userId: options.userId,
        type
      })
    } else {
      return analyzeScreen(imageData, {
        sessionId: options.sessionId,
        userId: options.userId,
        type
      })
    }
  }, [analyzeWebcam, analyzeScreen, options])

  return {
    // State
    isCapturing,
    stream,
    capturedImage,
    
    // Refs for components
    videoRef,
    canvasRef,
    
    // Actions
    startWebcam,
    stopWebcam,
    captureWebcamImage,
    captureScreen,
    analyzeImage,
    
    // Loading states
    isAnalyzing: isToolLoading('webcam') || isToolLoading('screen'),
    isWebcamAnalyzing: isToolLoading('webcam'),
    isScreenAnalyzing: isToolLoading('screen')
  }
}