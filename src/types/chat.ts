export type Role = "user" | "assistant" | "system";
export interface Message { role: Role; content: string; }

export interface ChatRequest {
  version: "v1";
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  data?: Record<string, unknown>;
}

export type ToolRunResult = {
  success: boolean;
  tokensUsed?: number;
  model?: string;
  errorCode?: string;
};
