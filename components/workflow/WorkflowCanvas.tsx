"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/core/utils";
import { TCAnalysisStep } from "./TCAnalysisStep";
import { ResearchStep } from "./ResearchStep";
import { SummaryStep } from "./SummaryStep";
import { PDFGenerationStep } from "./PDFGenerationStep";
import { useAllWorkflowArtifacts } from "@/lib/artifacts/workflow-hooks";
import { FileText, Target, FileCheck, Download, RefreshCw, CheckCircle } from "lucide-react";

interface WorkflowCanvasProps {
  className?: string;
  sessionId?: string;
  autoStart?: boolean;
}

type WorkflowStep = "tc-analysis" | "research" | "summary" | "pdf-generation";

export function WorkflowCanvas({ 
  className, 
  sessionId = "default",
  autoStart = false 
}: WorkflowCanvasProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("tc-analysis");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  
  const artifacts = useAllWorkflowArtifacts();

  // Auto-start workflow when component mounts
  useEffect(() => {
    if (autoStart && sessionId) {
      startWorkflow();
    }
  }, [autoStart, sessionId]);

  const startWorkflow = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Start with TC Analysis
      await generateArtifact("tc-analysis", {
        sessionId,
        documentData: workflowData?.documentData || {},
        query: "Analyze the uploaded Terms & Conditions document"
      });

      // Then move to Research
      setTimeout(async () => {
        await generateArtifact("research", {
          sessionId,
          leadData: workflowData?.leadData || {},
          conversationHistory: workflowData?.conversationHistory || []
        });
      }, 2000);

      // Then Summary
      setTimeout(async () => {
        await generateArtifact("summary", {
          sessionId,
          leadInfo: workflowData?.leadInfo || {},
          conversationHistory: workflowData?.conversationHistory || [],
          researchData: artifacts.research.data
        });
      }, 4000);

      // Finally PDF Generation
      setTimeout(async () => {
        await generateArtifact("pdf-generation", {
          sessionId,
          summaryData: artifacts.summary.data,
          leadInfo: workflowData?.leadInfo || {}
        });
      }, 6000);

    } catch (error) {
      console.error("Error starting workflow:", error);
      setGenerationError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateArtifact = async (artifactType: string, data: any) => {
    try {
      const response = await fetch("/api/workflow/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artifactType,
          data,
          context: {
            sessionId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate artifact");
      }

      const result = await response.json();
      console.log(`${artifactType} artifact generated successfully`, result.data);
      
      // Update the artifact state
      if (typeof window !== 'undefined') {
        // Dispatch a custom event to update the artifact state
        window.dispatchEvent(new CustomEvent('artifact-updated', {
          detail: { artifactType, data: result.data }
        }));
      }
    } catch (error) {
      console.error("Error generating artifact:", error);
      throw error;
    }
  };

  const workflowSteps = [
    { 
      id: "tc-analysis" as const, 
      name: "TC Analysis", 
      icon: FileText, 
      description: "Analyze Terms & Conditions",
      color: "blue"
    },
    { 
      id: "research" as const, 
      name: "Lead Research", 
      icon: Target, 
      description: "Gather lead intelligence",
      color: "green"
    },
    { 
      id: "summary" as const, 
      name: "Summary", 
      icon: FileCheck, 
      description: "Generate conversation summary",
      color: "purple"
    },
    { 
      id: "pdf-generation" as const, 
      name: "PDF Generation", 
      icon: Download, 
      description: "Create PDF document",
      color: "orange"
    }
  ];

  const getStepStatus = (stepId: WorkflowStep) => {
    const artifact = artifacts[stepId.replace("-", "") as keyof typeof artifacts];
    if (artifact?.error) return "error";
    if (artifact?.data) return "completed";
    if (artifact?.isStreaming) return "in-progress";
    return "pending";
  };

  const getStepColor = (stepId: WorkflowStep) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "in-progress": return "text-blue-600 bg-blue-100";
      case "error": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "tc-analysis":
        return <TCAnalysisStep className="w-full" documentData={workflowData?.documentData} />;
      case "research":
        return <ResearchStep className="w-full" leadData={workflowData?.leadData} />;
      case "summary":
        return <SummaryStep className="w-full" leadInfo={workflowData?.leadInfo} />;
      case "pdf-generation":
        return <PDFGenerationStep className="w-full" summaryData={workflowData?.summaryData} />;
      default:
        return (
          <div className="p-8 text-center text-text-muted">
            Select a workflow step to view details
          </div>
        );
    }
  };

  const allStepsCompleted = workflowSteps.every(step => getStepStatus(step.id) === "completed");

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">AI Workflow Canvas</h2>
        <div className="flex items-center space-x-2">
          {isGenerating && (
            <div className="flex items-center space-x-2 text-brand">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
              <span className="text-sm">Processing...</span>
            </div>
          )}
          {allStepsCompleted && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Workflow Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          const status = getStepStatus(step.id);
          const isActive = currentStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-left",
                isActive
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-border bg-surface hover:bg-surface-elevated text-text"
              )}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-5 h-5" />
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStepColor(step.id).split(' ')[0]
                )} />
              </div>
              <div>
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-text-muted">{step.description}</div>
                <div className="text-xs mt-1 capitalize">
                  {status === "in-progress" ? "Processing..." : status}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="flex space-x-2">
        <button
          onClick={startWorkflow}
          disabled={isGenerating}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          <span>{isGenerating ? "Processing..." : "Start Workflow"}</span>
        </button>
        
        <button
          onClick={() => {
            setCurrentStep("tc-analysis");
            setWorkflowData(null);
            setGenerationError(null);
          }}
          className="px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-elevated transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="p-3 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">Workflow Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{generationError}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-surface border border-border rounded-lg p-4 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Workflow Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {workflowSteps.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={cn(
                "p-2 rounded border text-center",
                status === "completed" ? "border-green-200 bg-green-50 text-green-800" :
                status === "in-progress" ? "border-blue-200 bg-blue-50 text-blue-800" :
                status === "error" ? "border-red-200 bg-red-50 text-red-800" :
                "border-gray-200 bg-gray-50 text-gray-600"
              )}
            >
              <div className="font-medium">{step.name}</div>
              <div className="capitalize">
                {status === "in-progress" ? "🔄 Processing" : 
                 status === "completed" ? "✅ Complete" :
                 status === "error" ? "❌ Error" : "⏳ Waiting"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}