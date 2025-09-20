"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/core/utils";
import { RealWorkflowCanvas } from "@/components/real-workflow/RealWorkflowCanvas";
import { useAllRealWorkflowArtifacts } from "@/lib/artifacts/real-workflow-hooks";
import { Shield, Search, Target, FileCheck, RefreshCw } from "lucide-react";

interface RealWorkflowMessageProps {
  message: {
    id: string;
    content: string;
    type?: "text" | "real-workflow";
    metadata?: {
      workflowType?: string;
      sessionId?: string;
    };
  };
  className?: string;
}

export function RealWorkflowMessage({ message, className }: RealWorkflowMessageProps) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [detectedWorkflow, setDetectedWorkflow] = useState<string>("consent");
  
  const artifacts = useAllRealWorkflowArtifacts();

  // Detect if message should trigger real workflow
  useEffect(() => {
    if (message.type === "real-workflow" || message.metadata?.workflowType) {
      setShowCanvas(true);
      setDetectedWorkflow(message.metadata?.workflowType || detectRealWorkflowType(message.content));
    }
  }, [message]);

  const detectRealWorkflowType = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("consent") || lowerContent.includes("terms") || lowerContent.includes("conditions")) {
      return "consent";
    } else if (lowerContent.includes("research") || lowerContent.includes("lead") || lowerContent.includes("intelligence")) {
      return "research";
    } else if (lowerContent.includes("personalize") || lowerContent.includes("context")) {
      return "personalization";
    } else if (lowerContent.includes("complete") || lowerContent.includes("pdf") || lowerContent.includes("follow-up")) {
      return "completion";
    }
    
    return "consent"; // default
  };

  const hasAnyWorkflowData = Object.values(artifacts).some(artifact => artifact.data);

  if (message.type !== "real-workflow" && !message.content.toLowerCase().includes("workflow") && !message.content.toLowerCase().includes("consent")) {
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
        
        {/* Real Workflow Trigger Button */}
        {!showCanvas && (
          <button
            onClick={() => {
              setShowCanvas(true);
              setDetectedWorkflow(detectRealWorkflowType(message.content));
            }}
            className="mt-3 px-4 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>🚀 Start Real F.B/c Workflow</span>
          </button>
        )}
      </div>

      {/* Real Workflow Canvas */}
      {showCanvas && (
        <div className="border border-brand/20 rounded-lg p-4 bg-brand/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand">Real F.B/c AI Workflow</h3>
            <button
              onClick={() => setShowCanvas(false)}
              className="text-text-muted hover:text-text transition-colors"
            >
              ✕
            </button>
          </div>
          
          <RealWorkflowCanvas 
            sessionId={message.metadata?.sessionId || "default"}
            autoStart={true}
            className="w-full"
          />
        </div>
      )}

      {/* Real Workflow Status Summary */}
      {hasAnyWorkflowData && (
        <div className="p-3 bg-surface-elevated border border-border rounded-lg">
          <h4 className="font-medium text-text mb-2">Real Workflow Progress</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(artifacts).map(([key, artifact]) => {
              const stepNames = {
                consent: "Consent & TC",
                researchProgress: "Lead Research", 
                contextPersonalization: "Personalization",
                sessionCompletion: "Completion",
                realWorkflow: "Workflow"
              };
              
              return (
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
                  <div className="font-medium">{stepNames[key as keyof typeof stepNames]}</div>
                  <div>
                    {artifact.data ? "✅ Complete" : 
                     artifact.isStreaming ? "🔄 Processing" : 
                     "⏳ Waiting"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}