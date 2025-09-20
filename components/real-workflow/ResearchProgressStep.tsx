"use client";

import { useResearchProgressArtifact } from "@/lib/artifacts/real-workflow-hooks";
import { cn } from "@/src/core/utils";
import { Search, Building, User, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ResearchProgressStepProps {
  className?: string;
  sessionId?: string;
}

export function ResearchProgressStep({ className, sessionId }: ResearchProgressStepProps) {
  const { data, isStreaming, error } = useResearchProgressArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">Research Error</h3>
        </div>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("p-4 border border-border rounded-lg bg-surface", className)}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
          <span className="text-text-muted">Starting lead research...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "analyzing": return "text-blue-600 bg-blue-100";
      case "searching": return "text-yellow-600 bg-yellow-100";
      case "starting": return "text-gray-600 bg-gray-100";
      case "error": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "analyzing": return <Search className="w-4 h-4" />;
      case "searching": return <Search className="w-4 h-4" />;
      case "starting": return <Clock className="w-4 h-4" />;
      case "error": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <Search className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">Lead Research Progress</h3>
          <p className="text-sm text-text-muted">
            Session: {data.sessionId} • {data.progress.currentStep}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-text">Research Progress</h4>
          <span className="text-sm font-medium text-text">{data.progress.percentage}%</span>
        </div>
        <div className="w-full bg-surface-elevated rounded-full h-2 mb-2">
          <div 
            className="bg-brand h-2 rounded-full transition-all duration-300"
            style={{ width: `${data.progress.percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted">
          <span>Step {data.progress.currentStep}</span>
          <span>{data.progress.totalSteps} total steps</span>
        </div>
      </div>

      {/* Status */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-text">Current Status</h4>
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(data.status)
          )}>
            {getStatusIcon(data.status)}
            <span className="ml-1 capitalize">{data.status}</span>
          </div>
        </div>
        <p className="text-text-muted text-sm">{data.progress.currentStep}</p>
      </div>

      {/* Research Results */}
      {data.research && (
        <div className="space-y-4">
          {/* Company Information */}
          {data.research.company && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
                <Building className="w-4 h-4" />
                Company Information
              </h4>
              <div className="space-y-2 text-sm">
                {data.research.company.name && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Company:</span>
                    <span className="text-text font-medium">{data.research.company.name}</span>
                  </div>
                )}
                {data.research.company.industry && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Industry:</span>
                    <span className="text-text font-medium">{data.research.company.industry}</span>
                  </div>
                )}
                {data.research.company.size && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Size:</span>
                    <span className="text-text font-medium">{data.research.company.size}</span>
                  </div>
                )}
                {data.research.company.summary && (
                  <div className="mt-2">
                    <span className="text-text-muted">Summary:</span>
                    <p className="text-text text-sm mt-1">{data.research.company.summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Person Information */}
          {data.research.person && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
                <User className="w-4 h-4" />
                Person Information
              </h4>
              <div className="space-y-2 text-sm">
                {data.research.person.name && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Name:</span>
                    <span className="text-text font-medium">{data.research.person.name}</span>
                  </div>
                )}
                {data.research.person.role && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Role:</span>
                    <span className="text-text font-medium">{data.research.person.role}</span>
                  </div>
                )}
                {data.research.person.seniority && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Seniority:</span>
                    <span className="text-text font-medium">{data.research.person.seniority}</span>
                  </div>
                )}
                {data.research.person.summary && (
                  <div className="mt-2">
                    <span className="text-text-muted">Summary:</span>
                    <p className="text-text text-sm mt-1">{data.research.person.summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role Analysis */}
          {data.research.role && (
            <div className="bg-surface border border-brand/20 rounded-lg p-4">
              <h4 className="font-semibold text-brand mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                Role Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Identified Role:</span>
                  <span className="text-text font-medium">{data.research.role}</span>
                </div>
                {data.research.confidence && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Confidence:</span>
                    <span className="text-text font-medium">
                      {Math.round(data.research.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Citations */}
          {data.research.citations && data.research.citations.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h4 className="font-semibold text-text mb-3">Sources Found</h4>
              <div className="space-y-2">
                {data.research.citations.map((citation, index) => (
                  <div key={index} className="border-l-2 border-brand/20 pl-3">
                    <div className="text-sm">
                      <a 
                        href={citation.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand hover:text-brand-hover font-medium"
                      >
                        {citation.title || citation.uri}
                      </a>
                      {citation.description && (
                        <p className="text-text-muted text-xs mt-1">{citation.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {data.error && (
        <div className="bg-surface border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">Research Error</h4>
          <p className="text-red-600 text-sm">{data.error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Research Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Researching lead...</span>
        </div>
      )}
    </div>
  );
}