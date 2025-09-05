export interface ChatRequest {
  messages: { role: 'user'|'assistant'|'system'; content: string }[];
}
export interface ChatChunk { id: string; content: string; }
