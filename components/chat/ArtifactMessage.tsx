"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/core/utils";
import { ArtifactCanvas } from "@/components/charts/ArtifactCanvas";
import { useAllArtifacts } from "@/lib/artifacts/artifact-hooks";

interface ArtifactMessageProps {
  message: {
    id: string;
    content: string;
    type?: "text" | "artifact";
    metadata?: {
      artifactType?: string;
      query?: string;
    };
  };
  className?: string;
}

export function ArtifactMessage({ message, className }: ArtifactMessageProps) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [detectedQuery, setDetectedQuery] = useState<string>("");
  const [suggestedArtifact, setSuggestedArtifact] = useState<string>("burn-rate");
  
  const artifacts = useAllArtifacts();

  // Detect if message should trigger artifact generation
  useEffect(() => {
    if (message.type === "artifact" || message.metadata?.artifactType) {
      setShowCanvas(true);
      setDetectedQuery(message.metadata?.query || message.content);
      setSuggestedArtifact(message.metadata?.artifactType || detectArtifactType(message.content));
    }
  }, [message]);

  const detectArtifactType = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("burn rate") || lowerContent.includes("burn rate") || lowerContent.includes("monthly burn")) {
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

  const hasAnyArtifactData = Object.values(artifacts).some(artifact => artifact.data);

  if (message.type !== "artifact" && !message.content.toLowerCase().includes("chart") && !message.content.toLowerCase().includes("analytics")) {
    // Regular text message
    return (
      <div className={cn("p-4 bg-surface border border-border rounded-lg", className)}>
        <p className="text-text whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Message Content */}
      <div className="p-4 bg-surface border border-border rounded-lg">
        <p className="text-text whitespace-pre-wrap">{message.content}</p>
        
        {/* Artifact Trigger Button */}
        {!showCanvas && (
          <button
            onClick={() => {
              setShowCanvas(true);
              setDetectedQuery(message.content);
              setSuggestedArtifact(detectArtifactType(message.content));
            }}
            className="mt-3 px-4 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium transition-colors"
          >
            📊 Generate Analytics Chart
          </button>
        )}
      </div>

      {/* Artifact Canvas */}
      {showCanvas && (
        <div className="border border-brand/20 rounded-lg p-4 bg-brand/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand">Analytics Canvas</h3>
            <button
              onClick={() => setShowCanvas(false)}
              className="text-text-muted hover:text-text transition-colors"
            >
              ✕
            </button>
          </div>
          
          <ArtifactCanvas 
            query={detectedQuery}
            autoGenerate={true}
            className="w-full"
          />
        </div>
      )}

      {/* Artifact Status Summary */}
      {hasAnyArtifactData && (
        <div className="p-3 bg-surface-elevated border border-border rounded-lg">
          <h4 className="font-medium text-text mb-2">Available Analytics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(artifacts).map(([key, artifact]) => (
              <div
                key={key}
                className={cn(
                  "p-2 rounded text-center",
                  artifact.data
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : artifact.isStreaming
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                )}
              >
                <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div>
                  {artifact.data ? "✅ Ready" : 
                   artifact.isStreaming ? "🔄 Loading" : 
                   "⏳ Waiting"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}