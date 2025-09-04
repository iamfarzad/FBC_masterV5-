/**
 * Gemini Live API WebSocket Client
 * Handles real-time multimodal streaming with Gemini 2.0
 */

export interface LiveConfig {
  model?: string
  systemInstruction?: string
  responseModalities?: ('TEXT' | 'AUDIO')[]
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName: string
      }
    }
  }
  tools?: any[]
  temperature?: number
}

export interface LiveMessage {
  clientContent?: {
    turns?: any[]
    turnComplete?: boolean
    realtimeInput?: {
      mediaChunks?: Array<{
        mimeType: string
        data: string // base64
      }>
    }
  }
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        text?: string
        inlineData?: {
          mimeType: string
          data: string // base64
        }
      }>
    }
    turnComplete?: boolean
  }
}

export class GeminiLiveClient extends EventTarget {
  private ws: WebSocket | null = null
  private config: LiveConfig
  private isConnected = false
  private messageQueue: LiveMessage[] = []
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private frameInterval: NodeJS.Timeout | null = null

  constructor(config: LiveConfig = {}) {
    super()
    this.config = {
      model: 'gemini-2.0-flash-exp',
      responseModalities: ['TEXT', 'AUDIO'],
      ...config
    }
  }

  async connect(apiKey: string): Promise<void> {
    if (this.isConnected) {
      console.warn('Already connected')
      return
    }

    // WebSocket URL for Gemini Live API
    const wsUrl = `wss://generativelanguage.googleapis.com/v1alpha/models/${this.config.model}:streamGenerateContent`
    
    const params = new URLSearchParams({
      key: apiKey,
      alt: 'sse'
    })

    this.ws = new WebSocket(`${wsUrl}?${params}`)
    
    this.ws.onopen = () => {
      this.isConnected = true
      console.log('✅ Connected to Gemini Live')
      this.dispatchEvent(new Event('open'))
      
      // Send initial configuration
      this.sendSetup()
      
      // Process queued messages
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift()
        if (msg) this.send(msg)
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const message: LiveMessage = JSON.parse(event.data)
        this.handleServerMessage(message)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.dispatchEvent(new CustomEvent('error', { detail: error }))
    }

    this.ws.onclose = () => {
      this.isConnected = false
      console.log('Disconnected from Gemini Live')
      this.dispatchEvent(new Event('close'))
      this.stopAllStreaming()
    }
  }

  private sendSetup(): void {
    const setupMessage = {
      setup: {
        config: {
          responseModalities: this.config.responseModalities,
          speechConfig: this.config.speechConfig,
          systemInstruction: this.config.systemInstruction ? {
            parts: [{ text: this.config.systemInstruction }]
          } : undefined,
          tools: this.config.tools,
          temperature: this.config.temperature
        }
      }
    }
    
    this.send(setupMessage)
  }

  private handleServerMessage(message: LiveMessage): void {
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.text) {
          this.dispatchEvent(new CustomEvent('text', { 
            detail: { text: part.text } 
          }))
        }
        
        if (part.inlineData) {
          this.dispatchEvent(new CustomEvent('audio', { 
            detail: { 
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data 
            }
          }))
          
          // Play audio automatically
          this.playAudio(part.inlineData.data, part.inlineData.mimeType)
        }
      }
    }
    
    if (message.serverContent?.turnComplete) {
      this.dispatchEvent(new Event('turnComplete'))
    }
  }

  private async playAudio(base64Data: string, mimeType: string): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext()
      }
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Decode audio
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer)
      
      // Play audio
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)
      source.start()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  send(message: any): void {
    if (!this.isConnected || !this.ws) {
      this.messageQueue.push(message)
      return
    }
    
    this.ws.send(JSON.stringify(message))
  }

  sendText(text: string, turnComplete: boolean = true): void {
    this.send({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete
      }
    })
  }

  // Start continuous audio streaming
  async startAudioStream(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      })
      
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const base64 = await this.blobToBase64(event.data)
          this.send({
            clientContent: {
              realtimeInput: {
                mediaChunks: [{
                  mimeType: 'audio/webm',
                  data: base64
                }]
              }
            }
          })
        }
      }
      
      // Send chunks every 100ms for real-time streaming
      this.mediaRecorder.start(100)
      console.log('🎤 Audio streaming started')
    } catch (error) {
      console.error('Failed to start audio stream:', error)
      throw error
    }
  }

  // Start continuous video streaming (webcam or screen)
  async startVideoStream(type: 'webcam' | 'screen'): Promise<MediaStream> {
    try {
      if (type === 'webcam') {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        })
      } else {
        this.mediaStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { width: 1280, height: 720 } 
        })
      }
      
      // Start sending frames every 1 second
      this.startFrameCapture()
      
      console.log(`📹 ${type} streaming started`)
      return this.mediaStream
    } catch (error) {
      console.error(`Failed to start ${type} stream:`, error)
      throw error
    }
  }

  private startFrameCapture(): void {
    if (!this.mediaStream) return
    
    const video = document.createElement('video')
    video.srcObject = this.mediaStream
    video.play()
    
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    
    // Capture and send frame every second
    this.frameInterval = setInterval(() => {
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const base64 = await this.blobToBase64(blob)
            this.send({
              clientContent: {
                realtimeInput: {
                  mediaChunks: [{
                    mimeType: 'image/jpeg',
                    data: base64
                  }]
                }
              }
            })
          }
        }, 'image/jpeg', 0.8)
      }
    }, 1000)
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1] || ''
        resolve(base64)
      }
      reader.readAsDataURL(blob)
    })
  }

  stopAudioStream(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
      this.mediaRecorder = null
    }
    
    if (this.mediaStream && !this.frameInterval) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    
    console.log('🎤 Audio streaming stopped')
  }

  stopVideoStream(): void {
    if (this.frameInterval) {
      clearInterval(this.frameInterval)
      this.frameInterval = null
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
    
    console.log('📹 Video streaming stopped')
  }

  stopAllStreaming(): void {
    this.stopAudioStream()
    this.stopVideoStream()
  }

  disconnect(): void {
    this.stopAllStreaming()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
  }

  isActive(): boolean {
    return this.isConnected
  }
}