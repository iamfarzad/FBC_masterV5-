// src/core/gemini-adapter.ts
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

export type GeminiModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash-preview-native-audio-dialog";

export class GeminiAdapter {
  private client: GoogleGenAI;

  constructor() {
    // NEW SDK requires an options object, not a raw string
    this.client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  // The new @google/genai SDK does NOT expose `generativeModel()`; you call
  // `client.models.generateContent{Stream}` directly with { model, contents }.
  async generateText(prompt: string, model: GeminiModel = 'gemini-2.5-flash') {
    return this.client.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  }

  async streamText(prompt: string, model: GeminiModel = 'gemini-2.5-flash') {
    return this.client.models.generateContentStream({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  }

  async streamWithHistory(history: any[], prompt: string, model: GeminiModel = "gemini-2.5-flash") {
    return this.client.models.generateContentStream({
      model,
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ]
    })
  }

  async analyzeImage(base64: string, prompt: string, mimeType = 'image/jpeg', model: GeminiModel = 'gemini-2.5-flash') {
    return this.client.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: prompt }, { inlineData: { data: base64, mimeType } }] }
      ]
    })
  }
}

export const gemini = new GeminiAdapter();
