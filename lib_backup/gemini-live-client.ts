import { 
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold 
} from '@google/generative-ai'

export interface LiveConfig {
  model?: string
  systemInstruction?: string
  generationConfig?: {
    temperature?: number
    topP?: number
    topK?: number
    maxOutputTokens?: number
    responseMimeType?: string
    responseSchema?: any
    stopSequences?: string[]
  }
  tools?: any[]
}

export interface LiveSession {
  model: string
  config: any
  websocket: WebSocket | null
  peerConnection: RTCPeerConnection | null
  makersuite: boolean
  url: string
}

export class GeminiLiveClient {
  private apiKey: string
  private session: LiveSession | null = null
  private audioContext: AudioContext | null = null
  private audioQueue: ArrayBuffer[] = []
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async connect(config: LiveConfig = {}) {
    const model = config.model || 'gemini-2.0-flash-exp'
    
    // WebSocket URL for Gemini Live API
    const wsUrl = `wss://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}`
    
    return new Promise<LiveSession>((resolve, reject) => {
      const ws = new WebSocket(wsUrl)
      
      this.session = {
        model,
        config,
        websocket: ws,
        peerConnection: null,
        makersuite: false,
        url: wsUrl
      }
      
      ws.onopen = () => {
        console.log('Connected to Gemini Live API')
        
        // Send initial setup message
        ws.send(JSON.stringify({
          setup: {
            model: `models/${model}`,
            generationConfig: {
              ...config.generationConfig,
              responseModalities: ['TEXT', 'AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Aoede' // or 'Charon', 'Fenrir', 'Kore', 'Puck'
                  }
                }
              }
            },
            systemInstruction: config.systemInstruction || 'You are a helpful AI assistant with live vision and audio capabilities.',
            tools: config.tools || []
          }
        }))
        
        resolve(this.session)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }
      
      ws.onclose = () => {
        console.log('Disconnected from Gemini Live API')
        this.session = null
      }
    })
  }
  
  private handleMessage(data: any) {
    if (data.serverContent) {
      const content = data.serverContent
      
      // Handle text responses
      if (content.modelTurn?.parts) {
        content.modelTurn.parts.forEach((part: any) => {
          if (part.text) {
            this.onTextResponse?.(part.text)
          }
          
          // Handle audio responses
          if (part.inlineData) {
            const audioData = part.inlineData.data
            const mimeType = part.inlineData.mimeType
            this.handleAudioResponse(audioData, mimeType)
          }
        })
      }
      
      // Handle turn completion
      if (content.turnComplete) {
        this.onTurnComplete?.()
      }
    }
    
    // Handle tool calls
    if (data.toolCall) {
      this.onToolCall?.(data.toolCall)
    }
  }
  
  private handleAudioResponse(audioData: string, mimeType: string) {
    // Convert base64 audio to ArrayBuffer
    const binaryString = atob(audioData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Play audio or queue it
    if (mimeType.includes('pcm')) {
      this.playPCMAudio(bytes.buffer, mimeType)
    }
    
    this.onAudioResponse?.(bytes.buffer, mimeType)
  }
  
  private async playPCMAudio(audioBuffer: ArrayBuffer, mimeType: string) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Parse sample rate from mime type (e.g., "audio/pcm;rate=24000")
    const rateMatch = mimeType.match(/rate=(\d+)/)
    const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000
    
    // Create audio buffer from PCM data
    const audioData = new Int16Array(audioBuffer)
    const floatData = new Float32Array(audioData.length)
    
    for (let i = 0; i < audioData.length; i++) {
      floatData[i] = audioData[i] / 32768.0 // Convert to float
    }
    
    const buffer = this.audioContext.createBuffer(1, floatData.length, sampleRate)
    buffer.copyToChannel(floatData, 0)
    
    // Play the audio
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.start()
  }
  
  // Send text message
  sendText(text: string) {
    if (!this.session?.websocket) {
      throw new Error('Not connected to Gemini Live')
    }
    
    this.session.websocket.send(JSON.stringify({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    }))
  }
  
  // Send audio data
  sendAudio(audioData: ArrayBuffer) {
    if (!this.session?.websocket) {
      throw new Error('Not connected to Gemini Live')
    }
    
    // Convert audio to base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)))
    
    this.session.websocket.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: base64
        }]
      }
    }))
  }
  
  // Send image/video frame
  sendImage(imageData: string, mimeType: string = 'image/jpeg') {
    if (!this.session?.websocket) {
      throw new Error('Not connected to Gemini Live')
    }
    
    // Remove data URL prefix if present
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, '')
    
    this.session.websocket.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType,
          data: base64
        }]
      }
    }))
  }
  
  // Send live video stream
  async startVideoStream(stream: MediaStream) {
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    // Send frames at 2 FPS
    const captureFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        // Get base64 image
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        this.sendImage(dataUrl)
      }
    }
    
    const intervalId = setInterval(captureFrame, 500) // 2 FPS
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId)
      stream.getTracks().forEach(track => track.stop())
    }
  }
  
  // Send live audio stream
  async startAudioStream(stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    })
    
    const audioProcessor = new WebRTCAudioProcessor()
    await audioProcessor.initializeAudio()
    
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const arrayBuffer = await event.data.arrayBuffer()
        // Convert to PCM and send
        const pcmData = await audioProcessor.processAudioForTranscription(arrayBuffer)
        this.sendAudio(pcmData)
      }
    }
    
    mediaRecorder.start(100) // Send chunks every 100ms
    
    // Return cleanup function
    return () => {
      mediaRecorder.stop()
      audioProcessor.cleanup()
      stream.getTracks().forEach(track => track.stop())
    }
  }
  
  // Disconnect from Gemini Live
  disconnect() {
    if (this.session?.websocket) {
      this.session.websocket.close()
      this.session = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
  
  // Event handlers (to be overridden)
  onTextResponse?: (text: string) => void
  onAudioResponse?: (audio: ArrayBuffer, mimeType: string) => void
  onToolCall?: (tool: any) => void
  onTurnComplete?: () => void
}

// Helper class for audio processing
class WebRTCAudioProcessor {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  
  async initializeAudio(): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
        channelCount: 1
      } 
    })
  }
  
  async processAudioForTranscription(audioBlob: ArrayBuffer): Promise<ArrayBuffer> {
    // Convert to 16kHz PCM for Gemini
    // This is a simplified version - real implementation would need proper resampling
    return audioBlob
  }
  
  cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}