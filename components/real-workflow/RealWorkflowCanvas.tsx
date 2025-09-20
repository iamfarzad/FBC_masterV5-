"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/core/utils";
import { ConsentStep } from "./ConsentStep";
import { ResearchProgressStep } from "./ResearchProgressStep";
import { useAllRealWorkflowArtifacts } from "@/lib/artifacts/real-workflow-hooks";
import { Shield, Search, Target, FileCheck, RefreshCw, CheckCircle } from "lucide-react";

interface RealWorkflowCanvasProps {
  className?: string;
  sessionId?: string;
  autoStart?: boolean;
}

type RealWorkflowStep = "consent" | "research" | "personalization" | "completion";

export function RealWorkflowCanvas({ 
  className, 
  sessionId = "default",
  autoStart = false 
}: RealWorkflowCanvasProps) {
  const [currentStep, setCurrentStep] = useState<RealWorkflowStep>("consent");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  
  const artifacts = useAllRealWorkflowArtifacts();

  // Auto-start workflow when component mounts
  useEffect(() => {
    if (autoStart && sessionId) {
      startRealWorkflow();
    }
  }, [autoStart, sessionId]);

  const startRealWorkflow = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Start with Consent
      await generateArtifact("consent", {
        sessionId,
        consentData: workflowData?.consentData || {
          name: "John Doe",
          email: "john@company.com",
          companyUrl: "https://company.com"
        }
      });

      // Then move to Research
      setTimeout(async () => {
        await generateArtifact("research-progress", {
          sessionId,
          researchData: workflowData?.researchData || {}
        });
      }, 2000);

      // Then Personalization
      setTimeout(async () => {
        await generateArtifact("context-personalization", {
          sessionId,
          contextData: artifacts.researchProgress.data
        });
      }, 4000);

      // Finally Completion
      setTimeout(async () => {
        await generateArtifact("session-completion", {
          sessionId,
          sessionData: artifacts.contextPersonalization.data
        });
      }, 6000);

    } catch (error) {
      console.error("Error starting real workflow:", error);
      setGenerationError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateArtifact = async (artifactType: string, data: any) => {
    try {
      const response = await fetch("/api/real-workflow/stream", {
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
        window.dispatchEvent(new CustomEvent('real-workflow-artifact-updated', {
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
      id: "consent" as const, 
      name: "Consent & TC", 
      icon: Shield, 
      description: "User fills out Terms & Conditions",
      color: "blue"
    },
    { 
      id: "research" as const, 
      name: "Lead Research", 
      icon: Search, 
      description: "AI researches lead and company",
      color: "green"
    },
    { 
      id: "personalization" as const, 
      name: "Personalization", 
      icon: Target, 
      description: "Conversation gets personalized",
      color: "purple"
    },
    { 
      id: "completion" as const, 
      name: "Completion", 
      icon: FileCheck, 
      description: "PDF generated and follow-up scheduled",
      color: "orange"
    }
  ];

  const getStepStatus = (stepId: RealWorkflowStep) => {
    const artifactMap = {
      consent: artifacts.consent,
      research: artifacts.researchProgress,
      personalization: artifacts.contextPersonalization,
      completion: artifacts.sessionCompletion
    };
    
    const artifact = artifactMap[stepId];
    if (artifact?.error) return "error";
    if (artifact?.data) return "completed";
    if (artifact?.isStreaming) return "in-progress";
    return "pending";
  };

  const getStepColor = (stepId: RealWorkflowStep) => {
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
      case "consent":
        return <ConsentStep className="w-full" consentData={workflowData?.consentData} />;
      case "research":
        return <ResearchProgressStep className="w-full" sessionId={sessionId} />;
      case "personalization":
        return (
          <div className="p-8 text-center text-text-muted">
            <Target className="w-12 h-12 mx-auto mb-4 text-brand" />
            <h3 className="text-lg font-semibold mb-2">Context Personalization</h3>
            <p>Research results are personalizing the AI conversation...</p>
          </div>
        );
      case "completion":
        return (
          <div className="p-8 text-center text-text-muted">
            <FileCheck className="w-12 h-12 mx-auto mb-4 text-brand" />
            <h3 className="text-lg font-semibold mb-2">Session Completion</h3>
            <p>PDF generation and follow-up workflow...</p>
          </div>
        );
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
        <h2 className="text-xl font-semibold text-text">Real F.B/c AI Workflow</h2>
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
          onClick={startRealWorkflow}
          disabled={isGenerating}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          <span>{isGenerating ? "Processing..." : "Start Real Workflow"}</span>
        </button>
        
        <button
          onClick={() => {
            setCurrentStep("consent");
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