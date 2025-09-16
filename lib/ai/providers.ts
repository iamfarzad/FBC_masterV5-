/**
 * AI SDK Providers Configuration
 * Simplified provider configuration
 */

import { google } from '@ai-sdk/google'

// Environment validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not found. Using fallback configuration.')
}

// Primary model configuration
export const model = google('gemini-1.5-pro-latest')

// Model selection based on mode
export function getModel(mode: string = 'standard') {
  switch (mode) {
    case 'admin':
    case 'realtime':
    case 'multimodal':
    case 'standard':
    default:
      return model
  }
}

// Model capabilities
export const modelCapabilities = {
  maxTokens: 8192,
  supportsImages: true,
  supportsStreaming: true,
  supportsTools: true
}

export default { model, getModel, modelCapabilities }