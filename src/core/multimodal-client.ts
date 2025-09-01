/**
 * Client-side utilities for multimodal AI integration
 * Provides easy-to-use functions for all multimodal modalities
 */

interface MultimodalOptions {
  sessionId?: string
  userId?: string
}

interface TextMessageOptions extends MultimodalOptions {
  content: string
}

interface VoiceMessageOptions extends MultimodalOptions {
  transcription: string
  duration: number
  audioData?: string // base64
}

interface VisionMessageOptions extends MultimodalOptions {
  content: string // analysis content
  imageData: string // base64
  imageType: string
  imageSize: number
}

interface FileUploadOptions extends MultimodalOptions {
  file: File
  autoAnalyze?: boolean // automatically analyze images/videos
}

export class MultimodalClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Send a text message to multimodal context
   */
  async sendText(options: TextMessageOptions): Promise<unknown> {
    return this.sendToMultimodal({
      modality: 'text',
      content: options.content,
      metadata: {
        sessionId: options.sessionId,
        userId: options.userId
      }
    })
  }

  /**
   * Send voice transcription to multimodal context
   */
  async sendVoice(options: VoiceMessageOptions): Promise<unknown> {
    return this.sendToMultimodal({
      modality: 'voice',
      metadata: {
        sessionId: options.sessionId,
        userId: options.userId,
        transcription: options.transcription,
        duration: options.duration
      }
    })
  }

  /**
   * Send visual analysis to multimodal context
   */
  async sendVision(options: VisionMessageOptions): Promise<unknown> {
    return this.sendToMultimodal({
      modality: 'vision',
      content: options.content,
      metadata: {
        sessionId: options.sessionId,
        userId: options.userId,
        fileData: options.imageData,
        fileType: options.imageType,
        imageSize: options.imageSize
      }
    })
  }

  /**
   * Upload file with optional auto-analysis for images/videos
   */
  async uploadFile(options: FileUploadOptions): Promise<unknown> {
    const formData = new FormData()
    formData.append('file', options.file)

    const headers = {
      'x-intelligence-session-id': options.sessionId || '',
      'x-user-id': options.userId || '',
      'x-modality-type': 'upload'
    }

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Analyze image using webcam tool
   */
  async analyzeImage(imageData: string, options: MultimodalOptions = {}): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/tools/webcam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intelligence-session-id': options.sessionId || '',
        'x-user-id': options.userId || ''
      },
      body: JSON.stringify({
        image: imageData,
        type: 'upload'
      })
    })

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Analyze screen capture
   */
  async analyzeScreen(imageData: string, options: MultimodalOptions = {}): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/tools/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intelligence-session-id': options.sessionId || '',
        'x-user-id': options.userId || ''
      },
      body: JSON.stringify({
        image: imageData,
        type: 'screen'
      })
    })

    if (!response.ok) {
      throw new Error(`Screen analysis failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get multimodal context summary
   */
  async getContext(sessionId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/multimodal?sessionId=${sessionId}`, {
      headers: this.defaultHeaders
    })

    if (!response.ok) {
      throw new Error(`Context retrieval failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Unified method to send any multimodal data
   */
  private async sendToMultimodal(data: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/multimodal`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Multimodal send failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Convert File to base64 for multimodal processing
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Check if file type is supported for analysis
   */
  static isAnalyzableFile(fileType: string): boolean {
    return fileType.startsWith('image/') || fileType.startsWith('video/')
  }
}

// Export singleton instance
export const multimodalClient = new MultimodalClient(
  typeof window !== 'undefined' ? '' : process.env.BASE_URL || 'http://localhost:3000'
)
