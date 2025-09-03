export class WebRTCAudioProcessor {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private analyser: AnalyserNode | null = null
  private chunks: Blob[] = []
  private isRecording = false

  async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      source.connect(this.analyser)
      
    } catch (error) {
      console.error('Audio initialization failed:', error)
      throw error
    }
  }

  startRecording(options: MediaRecorderOptions = {}): void {
    if (!this.mediaStream) {
      throw new Error('Audio not initialized')
    }

    this.chunks = []
    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: 'audio/webm',
      ...options
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }

    this.mediaRecorder.start()
    this.isRecording = true
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        this.chunks = []
        resolve(blob)
      }

      this.mediaRecorder.stop()
      this.isRecording = false
    })
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    const sum = dataArray.reduce((a, b) => a + b, 0)
    return sum / bufferLength
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)
    
    return dataArray
  }

  async processAudioForTranscription(audioBlob: Blob): Promise<ArrayBuffer> {
    // Convert audio blob to ArrayBuffer for processing
    return await audioBlob.arrayBuffer()
  }

  async applyNoiseReduction(audioData: ArrayBuffer): Promise<ArrayBuffer> {
    // Apply noise reduction algorithm (simplified version)
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(audioData)
    
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )

    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer

    // Create and configure filters
    const highPassFilter = offlineContext.createBiquadFilter()
    highPassFilter.type = 'highpass'
    highPassFilter.frequency.value = 100

    const lowPassFilter = offlineContext.createBiquadFilter()
    lowPassFilter.type = 'lowpass'
    lowPassFilter.frequency.value = 8000

    // Connect nodes
    source.connect(highPassFilter)
    highPassFilter.connect(lowPassFilter)
    lowPassFilter.connect(offlineContext.destination)

    source.start()
    const renderedBuffer = await offlineContext.startRendering()
    
    // Convert back to ArrayBuffer
    const wav = this.audioBufferToWav(renderedBuffer)
    return wav
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels = []
    let offset = 0
    let pos = 0

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    // RIFF identifier
    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length - 8
    setUint32(0x45564157) // "WAVE"

    // Format chunk
    setUint32(0x20746d66) // "fmt " chunk
    setUint32(16) // length = 16
    setUint16(1) // PCM
    setUint16(buffer.numberOfChannels)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels) // byte rate
    setUint16(buffer.numberOfChannels * 2) // block align
    setUint16(16) // bits per sample

    // Data chunk
    setUint32(0x61746164) // "data" chunk
    setUint32(length - pos - 4) // chunk length

    // Write audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]))
        view.setInt16(pos, sample * 0x7FFF, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.mediaStream = null
    this.mediaRecorder = null
    this.analyser = null
    this.audioContext = null
    this.chunks = []
    this.isRecording = false
  }

  isActive(): boolean {
    return this.isRecording
  }
}

export const webRTCAudioProcessor = new WebRTCAudioProcessor()