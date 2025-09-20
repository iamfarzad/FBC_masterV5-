"use client";

import { usePDFGenerationArtifact } from "@/lib/artifacts/workflow-hooks";
import { cn } from "@/src/core/utils";
import { FileText, Download, CheckCircle, AlertTriangle, Clock, File } from "lucide-react";

interface PDFGenerationStepProps {
  className?: string;
  summaryData?: any;
}

export function PDFGenerationStep({ className, summaryData }: PDFGenerationStepProps) {
  const { data, isStreaming, error } = usePDFGenerationArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">PDF Generation Error</h3>
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
          <span className="text-text-muted">Generating PDF document...</span>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (data.status.downloadUrl) {
      window.open(data.status.downloadUrl, '_blank');
    } else {
      // Trigger PDF generation API call
      fetch('/api/export-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: data.content.leadInfo.email, // Using email as session ID for now
          leadEmail: data.content.leadInfo.email,
        }),
      })
      .then(response => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('PDF generation failed');
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.document.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Failed to download PDF. Please try again.');
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-surface border border-border rounded-lg">
        <FileText className="w-6 h-6 text-brand" />
        <div>
          <h3 className="font-semibold text-text">PDF Generation Complete</h3>
          <p className="text-sm text-text-muted">
            {data.document.filename} • {data.document.format.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Document Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Document Info */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Document</h4>
            <File className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-sm">
            <p className="text-text-muted">Format:</p>
            <p className="text-text font-medium">{data.document.format.toUpperCase()}</p>
            <p className="text-text-muted mt-1">Size:</p>
            <p className="text-text font-medium">{formatFileSize(data.document.size)}</p>
            {data.document.pages && (
              <>
                <p className="text-text-muted mt-1">Pages:</p>
                <p className="text-text font-medium">{data.document.pages}</p>
              </>
            )}
          </div>
        </div>

        {/* Generation Status */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Status</h4>
            {data.status.generated ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className="text-sm">
            <p className="text-text-muted">Generated:</p>
            <p className={cn(
              "font-medium",
              data.status.generated ? "text-green-600" : "text-yellow-600"
            )}>
              {data.status.generated ? "Yes" : "In Progress"}
            </p>
            {data.status.error && (
              <>
                <p className="text-text-muted mt-1">Error:</p>
                <p className="text-red-600 text-xs">{data.status.error}</p>
              </>
            )}
          </div>
        </div>

        {/* Generated At */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text">Generated</h4>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>
          <div className="text-sm">
            <p className="text-text-muted">Date:</p>
            <p className="text-text font-medium">
              {new Date(data.document.generatedAt).toLocaleDateString()}
            </p>
            <p className="text-text-muted mt-1">Time:</p>
            <p className="text-text font-medium">
              {new Date(data.document.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Lead Information */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Lead Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Name:</span>
            <p className="text-text font-medium">{data.content.leadInfo.name}</p>
          </div>
          <div>
            <span className="text-text-muted">Email:</span>
            <p className="text-text font-medium">{data.content.leadInfo.email}</p>
          </div>
          {data.content.leadInfo.company && (
            <div>
              <span className="text-text-muted">Company:</span>
              <p className="text-text font-medium">{data.content.leadInfo.company}</p>
            </div>
          )}
          {data.content.leadInfo.role && (
            <div>
              <span className="text-text-muted">Role:</span>
              <p className="text-text font-medium">{data.content.leadInfo.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation History Preview */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Conversation History ({data.content.conversationHistory.length} messages)</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.content.conversationHistory.slice(0, 5).map((message, index) => (
            <div key={index} className="border-l-2 border-brand/20 pl-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className={cn(
                  "text-xs font-medium",
                  message.role === 'user' ? "text-brand" : "text-text-muted"
                )}>
                  {message.role === 'user' ? '👤 User' : '🤖 F.B/c AI'}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-text-muted line-clamp-2">
                {message.content}
              </p>
            </div>
          ))}
          {data.content.conversationHistory.length > 5 && (
            <p className="text-xs text-text-muted text-center">
              ... and {data.content.conversationHistory.length - 5} more messages
            </p>
          )}
        </div>
      </div>

      {/* Lead Research Preview */}
      {data.content.leadResearch && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <h4 className="font-semibold text-text mb-3">Lead Research Summary</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-text-muted">Lead Score:</span>
              <span className="ml-2 font-medium text-brand">{data.content.leadResearch.leadScore}/100</span>
            </div>
            <div>
              <span className="text-text-muted">Consultant Brief:</span>
              <p className="text-text-muted mt-1">{data.content.leadResearch.consultantBrief}</p>
            </div>
            <div>
              <span className="text-text-muted">AI Capabilities:</span>
              <p className="text-text-muted mt-1">{data.content.leadResearch.aiCapabilitiesShown}</p>
            </div>
          </div>
        </div>
      )}

      {/* Download Actions */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Download Options</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            disabled={!data.status.generated}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors",
              data.status.generated
                ? "bg-brand hover:bg-brand-hover text-surface"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          
          {data.status.downloadUrl && (
            <button
              onClick={() => window.open(data.status.downloadUrl, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text hover:bg-surface-elevated transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Online</span>
            </button>
          )}
        </div>
        
        {!data.status.generated && (
          <p className="text-sm text-text-muted mt-2">
            PDF is being generated. This may take a few moments...
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Generation Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Filename: {data.document.filename}</span>
          <span>Size: {formatFileSize(data.document.size)}</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Generating PDF...</span>
        </div>
      )}
    </div>
  );
}