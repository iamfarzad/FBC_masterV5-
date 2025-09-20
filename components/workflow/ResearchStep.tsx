"use client";

import { useResearchArtifact } from "@/lib/artifacts/workflow-hooks";
import { cn } from "@/src/core/utils";
import { User, Building, Target, TrendingUp, Clock, Star } from "lucide-react";

interface ResearchStepProps {
  className?: string;
  leadData?: any;
}

export function ResearchStep({ className, leadData }: ResearchStepProps) {
  const { data, isStreaming, error } = useResearchArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-red-600" />
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
          <span className="text-text-muted">Researching lead intelligence...</span>
        </div>
      </div>
    );
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <Target className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">Lead Research Complete</h3>
          <p className="text-sm text-text-muted">
            {data.lead.name} • {data.lead.company || 'Unknown Company'}
          </p>
        </div>
      </div>

      {/* Lead Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Details */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
            <User className="w-4 h-4" />
            Lead Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Name:</span>
              <span className="text-text font-medium">{data.lead.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Email:</span>
              <span className="text-text font-medium">{data.lead.email}</span>
            </div>
            {data.lead.company && (
              <div className="flex justify-between">
                <span className="text-text-muted">Company:</span>
                <span className="text-text font-medium">{data.lead.company}</span>
              </div>
            )}
            {data.lead.role && (
              <div className="flex justify-between">
                <span className="text-text-muted">Role:</span>
                <span className="text-text font-medium">{data.lead.role}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-muted">Confidence:</span>
              <span className={cn("font-medium", getConfidenceColor(data.lead.confidence))}>
                {Math.round(data.lead.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Lead Score */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
            <Star className="w-4 h-4" />
            Lead Score
          </h4>
          <div className="text-center">
            <div className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold mb-2",
              getLeadScoreColor(data.research.leadScore)
            )}>
              {data.research.leadScore}
            </div>
            <p className="text-sm text-text-muted">out of 100</p>
          </div>
        </div>
      </div>

      {/* Conversation Summary */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Conversation Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.research.conversationSummary}</p>
      </div>

      {/* Consultant Brief */}
      <div className="bg-surface border border-brand/20 rounded-lg p-4">
        <h4 className="font-semibold text-brand mb-2">Consultant Brief</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.research.consultantBrief}</p>
      </div>

      {/* Pain Points */}
      <div className="bg-surface border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-3">Pain Points Identified</h4>
        <ul className="space-y-2">
          {data.research.painPoints.map((painPoint, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-red-700 text-sm">{painPoint}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interests */}
      <div className="bg-surface border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-3">Interests & Opportunities</h4>
        <ul className="space-y-2">
          {data.research.interests.map((interest, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-700 text-sm">{interest}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Capabilities Shown */}
      <div className="bg-surface border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3">AI Capabilities Demonstrated</h4>
        <div className="flex flex-wrap gap-2">
          {data.research.aiCapabilitiesShown.map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-surface border border-brand/20 rounded-lg p-4">
        <h4 className="font-semibold text-brand mb-3">Recommended Next Steps</h4>
        <ul className="space-y-2">
          {data.research.nextSteps.map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-text-muted text-sm">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Company Context */}
      {data.context.companyContext && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
            <Building className="w-4 h-4" />
            Company Context
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Company:</span>
              <span className="text-text font-medium">{data.context.companyContext.name}</span>
            </div>
            {data.context.companyContext.industry && (
              <div className="flex justify-between">
                <span className="text-text-muted">Industry:</span>
                <span className="text-text font-medium">{data.context.companyContext.industry}</span>
              </div>
            )}
            {data.context.companyContext.size && (
              <div className="flex justify-between">
                <span className="text-text-muted">Size:</span>
                <span className="text-text font-medium">{data.context.companyContext.size}</span>
              </div>
            )}
            <div className="mt-2">
              <span className="text-text-muted">Summary:</span>
              <p className="text-text text-sm mt-1">{data.context.companyContext.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Research Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
          <span>Lead Score: {data.research.leadScore}/100</span>
        </div>
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