// src/core/live/client.ts
// Unified-approved infra adapter for Gemini Live connections.
// This centralizes all direct @google/genai usage so hooks/components never import it.

import { GoogleGenAI, Modality } from '@google/genai'

export type LiveConnectOptions = {
  apiKey: string
  model?: string
  // Pass-through bag for the SDK's live.connect options (keep it loose to avoid type friction)
  // See Google SDK docs for exact shape; we intentionally keep this permissive here.
  config?: Record<string, unknown>
}

/**
 * Connect to Gemini Live using the approved adapter.
 * Hooks/components should call this function, not @google/genai directly.
 */
export async function connectLive(options: LiveConnectOptions) {
  const { apiKey, model, config } = options
  const genAI = new GoogleGenAI({ apiKey })

  // sensible default; can be overridden by caller
  const liveModel =
    model ?? 'gemini-2.5-flash-preview-native-audio-dialog'

  // default response modalities if caller didn't specify
  const mergedConfig: Record<string, unknown> = {
    responseModalities: [Modality.AUDIO, Modality.TEXT],
    ...config,
  }

  // Returns the session object from the SDK (with sendRealtimeInput, close, etc.)
  // Keep the type loose to avoid pinning to SDK internals.
  const session = await genAI.live.connect({
    model: liveModel,
    ...mergedConfig,
  } as any)

  return session as any
}
