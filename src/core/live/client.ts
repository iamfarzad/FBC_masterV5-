// src/core/live/client.ts
// Unified-approved infra adapter for Gemini Live connections.
// This centralizes all direct @google/genai usage so hooks/components never import it.

import {
  GoogleGenAI,
  Modality,
  type GoogleGenAIOptions,
  type LiveCallbacks,
  type LiveConnectConfig,
} from '@google/genai'

type LiveConnectConfigWithLegacyFields = (LiveConnectConfig & {
  /**
   * Legacy support: callers previously passed callbacks inside config. We still accept that shape
   * to avoid breaking older hooks, but callbacks will be lifted to the proper top-level field.
   */
  callbacks?: LiveCallbacks
  responseModalities?: Array<Modality | string>
}) | null | undefined

export type LiveConnectOptions = {
  apiKey: string
  model?: string
  /** Optional Live API configuration bag. */
  config?: LiveConnectConfigWithLegacyFields
  /** Optional callbacks for the live session. */
  callbacks?: LiveCallbacks | null
  /** Additional client options forwarded to the GoogleGenAI constructor. */
  clientOptions?: Omit<GoogleGenAIOptions, 'apiKey'>
}

/**
 * Connect to Gemini Live using the approved adapter.
 * Hooks/components should call this function, not @google/genai directly.
 */
export async function connectLive(options: LiveConnectOptions) {
  const { apiKey, model, config, callbacks, clientOptions } = options
  const genAI = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1alpha',
    ...clientOptions,
  })

  // sensible default; can be overridden by caller
  const liveModel =
    model ?? 'gemini-2.5-flash-preview-native-audio-dialog'

  const configBag: Record<string, unknown> = {
    ...(config ?? {}),
  }

  // Lift legacy callbacks out of the config bag if present.
  let callbacksFromConfig: LiveCallbacks | undefined
  if (typeof configBag.callbacks !== 'undefined') {
    callbacksFromConfig = configBag.callbacks as LiveCallbacks
    delete configBag.callbacks
  }

  const typedConfig = configBag as LiveConnectConfig

  const normalizeModalities = (
    modalities?: Array<Modality | string> | null,
  ): Modality[] => {
    if (!modalities || modalities.length === 0) {
      return [Modality.AUDIO, Modality.TEXT]
    }

    return modalities.map((modality) => {
      if (typeof modality === 'string') {
        const upper = modality.toUpperCase()
        return (
          (Modality as unknown as Record<string, Modality>)[upper] ??
          (upper as Modality)
        )
      }
      return modality
    })
  }

  const normalizedConfig: LiveConnectConfig = {
    ...typedConfig,
    responseModalities: normalizeModalities(
      (config as LiveConnectConfigWithLegacyFields)?.responseModalities ??
        typedConfig.responseModalities ??
        null,
    ),
  }

  const resolvedCallbacks = callbacks ?? callbacksFromConfig ?? undefined

  // Returns the session object from the SDK (with sendRealtimeInput, close, etc.)
  // Keep the type loose to avoid pinning to SDK internals.
  const session = await genAI.live.connect({
    model: liveModel,
    ...(resolvedCallbacks ? { callbacks: resolvedCallbacks } : {}),
    config: normalizedConfig,
  } as any)

  return session as any
}
