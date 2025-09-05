// components/chat/types.ts
import type { UnifiedMessage } from '@/src/core/chat/unified-types.js';

// business content in messages can be a plain string or a structured block
export type BusinessContent =
  | string
  | {
      type: string;        // e.g. 'text' | 'html' | 'markdown' | ...
      text?: string;
      html?: string;
    };

// card shown by the "video-to-app" tool (add fields your UI reads)
export type VideoToAppCard = {
  title?: string;
  description?: string;
  url?: string;           // generic link
  thumbnailUrl?: string;
  videoUrl?: string;      // <-- missing in your errors
  status?:               // <-- missing in your errors
    | 'queued'
    | 'processing'
    | 'done'
    | 'error'
    | string;
  progress?: number;      // <-- missing in your errors
  code?: string;          // <-- missing in your errors (embed/iframes etc.)
};

// UI superset of the core message, matching what components expect
export interface ChatMessageUI extends UnifiedMessage {
  businessContent?: BusinessContent;
  imageUrl?: string | null;
  videoToAppCard?: VideoToAppCard | null;
  sources?: Array<{ url: string; title?: string; [key: string]: unknown }>;
}

// Re-export Tool types for convenience (type-only)
export type {
  ToolInput,
  ToolResult,
  ToolOutput,
  ToolExecution,
} from '@/hooks/useTools-ui';
