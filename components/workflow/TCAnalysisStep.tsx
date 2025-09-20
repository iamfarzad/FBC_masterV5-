"use client";

import { useTCAnalysisArtifact } from "@/lib/artifacts/workflow-hooks";
import { cn } from "@/src/core/utils";
import { FileText, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";

interface TCAnalysisStepProps {
  className?: string;
  documentData?: any;
}

export function TCAnalysisStep({ className, documentData }: TCAnalysisStepProps) {
  const { data, isStreaming, error } = useTCAnalysisArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">TC Analysis Error</h3>
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
          <span className="text-text-muted">Analyzing Terms & Conditions...</span>
        </div>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "critical": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <FileText className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">TC Analysis Complete</h3>
          <p className="text-sm text-text-muted">
            {data.document.filename} • {data.document.type} • {data.document.size} bytes
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Executive Summary
        </h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.analysis.executiveSummary}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Level */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Risk Level</h4>
            <AlertTriangle className="w-4 h-4 text-text-muted" />
          </div>
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            getRiskColor(data.analysis.riskLevel)
          )}>
            {data.analysis.riskLevel.toUpperCase()}
          </div>
        </div>

        {/* Compliance Score */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Compliance Score</h4>
            <Shield className="w-4 h-4 text-text-muted" />
          </div>
          <div className={cn("text-2xl font-bold", getComplianceColor(data.analysis.complianceScore))}>
            {data.analysis.complianceScore}/100
          </div>
        </div>

        {/* Processing Time */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Processing Time</h4>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text">
            {data.metadata.processingTime}s
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Key Points</h4>
        <ul className="space-y-2">
          {data.analysis.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-text-muted text-sm">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Business Risks */}
      <div className="bg-surface border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-3 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          Business Risks
        </h4>
        <ul className="space-y-2">
          {data.analysis.businessRisks.map((risk, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-red-700 text-sm">{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Opportunities */}
      <div className="bg-surface border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          Opportunities
        </h4>
        <ul className="space-y-2">
          {data.analysis.opportunities.map((opportunity, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-700 text-sm">{opportunity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-surface border border-brand/20 rounded-lg p-4">
        <h4 className="font-semibold text-brand mb-3">Recommendations</h4>
        <ul className="space-y-2">
          {data.analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-text-muted text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Analysis Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Confidence: {Math.round(data.metadata.confidence * 100)}%</span>
          <span>Language: {data.metadata.language}</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Analyzing document...</span>
        </div>
      )}
    </div>
  );
}