/**
 * Gemini Live API Client using official @google/genai library
 * Based on working template from /Users/farzad/Downloads/live-audio (6)
 */

import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  onAudioResponse?: (audioData: any) => void;
  onTextResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

export class GeminiLiveClient {
  private client: GoogleGenAI;
  private session: Session | null = null;
  private config: GeminiLiveConfig;
  private isConnected = false;

  constructor(config: GeminiLiveConfig) {
    this.config = {
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      ...config
    };

    this.client = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });
  }

  async connect(): Promise<void> {
    try {
      this.config.onStatusChange?.('Connecting to Gemini Live...');

      this.session = await this.client.live.connect({
        model: this.config.model!,
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            this.config.onStatusChange?.('Connected');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle text responses
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
              this.config.onTextResponse?.(text);
            }

            // Handle audio responses
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (audio) {
              this.config.onAudioResponse?.(audio);
            }

            // Handle interruptions
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              this.config.onStatusChange?.('Response interrupted');
            }
          },
          onerror: (error: ErrorEvent) => {
            this.config.onError?.(new Error(error.message));
            this.config.onStatusChange?.('Connection error');
          },
          onclose: (event: CloseEvent) => {
            this.isConnected = false;
            this.config.onStatusChange?.(`Connection closed: ${event.reason}`);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
          },
        },
      });

      this.config.onStatusChange?.('Connected to Gemini Live');
    } catch (error) {
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  async sendAudio(audioData: ArrayBuffer | Blob): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Gemini Live session');
    }

    try {
      await this.session.sendRealtimeInput({ media: audioData });
    } catch (error) {
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  async sendText(text: string): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Gemini Live session');
    }

    try {
      await this.session.sendRealtimeInput({
        text: text
      });
    } catch (error) {
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.session) {
      this.session.close();
      this.session = null;
      this.isConnected = false;
      this.config.onStatusChange?.('Disconnected');
    }
  }

  isSessionActive(): boolean {
    return this.isConnected && this.session !== null;
  }

  // Utility method to create PCM blob from audio data (for real-time streaming)
  createPCMBlob(pcmData: Float32Array): Blob {
    // Convert Float32Array to Int16Array (16-bit PCM)
    const int16Array = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
    }

    return new Blob([int16Array.buffer], { type: 'audio/pcm' });
  }
}