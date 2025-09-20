"use client";

import { useState, useCallback } from "react";
import { useUnifiedChat } from "./useUnifiedChat";
import { ArtifactStreamingService } from "@/lib/artifacts/streaming-service";

interface ArtifactChatOptions {
  sessionId?: string;
  mode?: "standard" | "admin";
  autoGenerateArtifacts?: boolean;
}

interface ArtifactChatReturn {
  messages: any[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  generateArtifact: (type: string, query: string) => Promise<void>;
  clearMessages: () => void;
  artifactStatus: {
    isGenerating: boolean;
    lastGenerated: string | null;
    error: string | null;
  };
}

/**
 * Enhanced Chat Hook with Artifact Support
 * Integrates the unified chat with artifact generation capabilities
 */
export function useArtifactChat(options: ArtifactChatOptions = {}): ArtifactChatReturn {
  const {
    sessionId = "default",
    mode = "standard",
    autoGenerateArtifacts = true
  } = options;

  const [artifactStatus, setArtifactStatus] = useState({
    isGenerating: false,
    lastGenerated: null as string | null,
    error: null as string | null,
  });

  const chat = useUnifiedChat({
    sessionId,
    mode,
    initialMessages: [],
  });

  const generateArtifact = useCallback(async (type: string, query: string) => {
    if (!query.trim()) return;

    setArtifactStatus(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      await ArtifactStreamingService.streamArtifact(type, query, {
        sessionId,
        mode,
        timestamp: new Date().toISOString(),
      });

      setArtifactStatus(prev => ({ 
        ...prev, 
        isGenerating: false, 
        lastGenerated: `${type} for "${query}"` 
      }));
    } catch (error) {
      console.error("Error generating artifact:", error);
      setArtifactStatus(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }));
    }
  }, [sessionId, mode]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Send the regular message
    await chat.sendMessage(content);

    // Auto-generate artifacts if enabled and content suggests analytics
    if (autoGenerateArtifacts && shouldGenerateArtifact(content)) {
      const artifactType = detectArtifactType(content);
      await generateArtifact(artifactType, content);
    }
  }, [chat, autoGenerateArtifacts, generateArtifact]);

  const shouldGenerateArtifact = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    const artifactKeywords = [
      "chart", "graph", "analytics", "data", "visualization",
      "burn rate", "revenue", "sales", "leads", "conversion",
      "dashboard", "metrics", "performance", "trends"
    ];
    
    return artifactKeywords.some(keyword => lowerContent.includes(keyword));
  };

  const detectArtifactType = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("burn rate") || lowerContent.includes("monthly burn")) {
      return "burn-rate";
    } else if (lowerContent.includes("revenue") || lowerContent.includes("sales") || lowerContent.includes("income")) {
      return "revenue-analytics";
    } else if (lowerContent.includes("lead") || lowerContent.includes("conversion") || lowerContent.includes("funnel")) {
      return "lead-conversion";
    } else if (lowerContent.includes("dashboard") || lowerContent.includes("overview") || lowerContent.includes("performance")) {
      return "performance-dashboard";
    }
    
    return "burn-rate"; // default
  };

  const clearMessages = useCallback(() => {
    // This would need to be implemented in the chat hook
    // For now, we'll just clear the artifact status
    setArtifactStatus({
      isGenerating: false,
      lastGenerated: null,
      error: null,
    });
  }, []);

  return {
    messages: chat.messages,
    isLoading: chat.isLoading,
    isStreaming: chat.isStreaming,
    error: chat.error,
    sendMessage,
    generateArtifact,
    clearMessages,
    artifactStatus,
  };
}