export type Role = "user" | "assistant" | "system";
export interface ChatMessage { role: Role; content: string; timestamp?: string | undefined; }
export interface ChatRequest {
  version: "v1";
  messages: ChatMessage[];
  model?: string | undefined;
  temperature?: number | undefined;
  max_tokens?: number | undefined;
  data?: {
    leadContext?: unknown;
    intelligenceContext?: unknown;
    enableGoogleSearch?: boolean | undefined;
  } | undefined;
}
export type ChatMode = "default" | "tools" | "research";
export type ToolRunResult = { success: boolean; tokensUsed?: number | undefined; model?: string | undefined; errorCode?: string | undefined };