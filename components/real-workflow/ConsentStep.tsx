"use client";

import { useConsentArtifact } from "@/lib/artifacts/real-workflow-hooks";
import { cn } from "@/src/core/utils";
import { User, Mail, Building, CheckCircle, Clock, Shield } from "lucide-react";

interface ConsentStepProps {
  className?: string;
  consentData?: any;
}

export function ConsentStep({ className, consentData }: ConsentStepProps) {
  const { data, isStreaming, error } = useConsentArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">Consent Error</h3>
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
          <span className="text-text-muted">Processing consent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <Shield className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">Consent & TC Complete</h3>
          <p className="text-sm text-text-muted">
            {data.user.name} • {data.user.email}
          </p>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3 flex items-center space-x-2">
          <User className="w-4 h-4" />
          User Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-text-muted" />
            <div>
              <span className="text-text-muted">Name:</span>
              <p className="text-text font-medium">{data.user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-text-muted" />
            <div>
              <span className="text-text-muted">Email:</span>
              <p className="text-text font-medium">{data.user.email}</p>
            </div>
          </div>
          {data.user.companyUrl && (
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-text-muted" />
              <div>
                <span className="text-text-muted">Company:</span>
                <p className="text-text font-medium">{data.user.companyUrl}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consent Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consent Allowed */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Consent Status</h4>
            {data.consent.allowed ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className={cn(
            "text-lg font-bold",
            data.consent.allowed ? "text-green-600" : "text-yellow-600"
          )}>
            {data.consent.allowed ? "Granted" : "Pending"}
          </div>
        </div>

        {/* Research Triggered */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Research Triggered</h4>
            {data.researchTriggered ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className={cn(
            "text-lg font-bold",
            data.researchTriggered ? "text-green-600" : "text-yellow-600"
          )}>
            {data.researchTriggered ? "Yes" : "No"}
          </div>
        </div>

        {/* Intelligence Ready */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Intelligence Ready</h4>
            {data.intelligenceReady ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className={cn(
            "text-lg font-bold",
            data.intelligenceReady ? "text-green-600" : "text-yellow-600"
          )}>
            {data.intelligenceReady ? "Ready" : "Processing"}
          </div>
        </div>
      </div>

      {/* Consent Details */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Consent Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Session ID:</span>
            <span className="text-text font-mono text-xs">{data.consent.sessionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Timestamp:</span>
            <span className="text-text">{new Date(data.consent.timestamp).toLocaleString()}</span>
          </div>
          {data.consent.policyVersion && (
            <div className="flex justify-between">
              <span className="text-text-muted">Policy Version:</span>
              <span className="text-text">{data.consent.policyVersion}</span>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Next Steps</h4>
        <div className="space-y-2 text-sm">
          {data.researchTriggered && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-brand rounded-full"></div>
              <span className="text-text-muted">Lead research has been initiated</span>
            </div>
          )}
          {data.intelligenceReady && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-text-muted">AI conversation is now personalized</span>
            </div>
          )}
          {!data.intelligenceReady && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-text-muted">Research in progress - conversation will be personalized soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Consent Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Processing consent...</span>
        </div>
      )}
    </div>
  );
}