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

  async streamWithHistory(history: any[], prompt: string, model: GeminiModel = "gemini-2.5-flash", systemInstruction?: string) {
    const contents = systemInstruction
      ? [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "I understand my role and will follow these instructions throughout our conversation." }] },
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ]
      : [
          ...history,
          { role: "user", parts: [{ text: prompt }] }
        ]

    return this.client.models.generateContentStream({
      model,
      contents
    })
  }

  async streamWithContext(history: any[], prompt: string, sessionId?: string, model: GeminiModel = "gemini-2.5-flash") {
    // Generate context-aware system prompt inline
    let userContext = '';

    if (sessionId) {
      try {
        const { ContextStorage } = await import('./context/context-storage');
        const contextStorage = new ContextStorage();
        const ctx = await contextStorage.get(sessionId);

        if (ctx) {
          userContext = `
  Context about this user:
  ${JSON.stringify({
    lead: {
      email: ctx.email,
      name: ctx.name
    },
    company: ctx.company_context,
    person: ctx.person_context,
    role: ctx.role,
    roleConfidence: ctx.role_confidence
  }, null, 2)}
          `;
        }
      } catch (error) {
        console.warn('Failed to load user context for system prompt:', error);
      }
    }

    // Import and use the F.B/c personality model
    const { generateFBCPersonalityPrompt } = await import('./personality/fbc-persona');

    const personalityPrompt = generateFBCPersonalityPrompt(sessionId, userContext ? {
      lead: {
        email: 'unknown',
        name: 'unknown'
      },
      company: null,
      person: null,
      role: null,
      roleConfidence: 0
    } : undefined);

    return this.streamWithHistory(history, prompt, model, personalityPrompt);
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
