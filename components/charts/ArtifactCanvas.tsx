"use client";

import { useState, useEffect } from "react";
import { cn } from "@/src/core/utils";
import { BurnRateChart } from "./BurnRateChart";
import { RevenueAnalyticsChart } from "./RevenueAnalyticsChart";
import { LeadConversionChart } from "./LeadConversionChart";
import { useAllArtifacts } from "@/lib/artifacts/artifact-hooks";

interface ArtifactCanvasProps {
  className?: string;
  query?: string;
  autoGenerate?: boolean;
}

type ArtifactType = "burn-rate" | "revenue-analytics" | "lead-conversion" | "performance-dashboard";

export function ArtifactCanvas({ 
  className, 
  query = "",
  autoGenerate = false 
}: ArtifactCanvasProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType>("burn-rate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const artifacts = useAllArtifacts();

  // Auto-generate artifact when query changes
  useEffect(() => {
    if (autoGenerate && query.trim()) {
      generateArtifact(selectedArtifact, query);
    }
  }, [query, selectedArtifact, autoGenerate]);

  const generateArtifact = async (artifactType: ArtifactType, queryText: string) => {
    if (!queryText.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/artifacts/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artifactType,
          query: queryText,
          context: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate artifact");
      }

      console.log(`${artifactType} artifact generated successfully`);
    } catch (error) {
      console.error("Error generating artifact:", error);
      setGenerationError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsGenerating(false);
    }
  };

  const artifactTypes = [
    { id: "burn-rate" as const, name: "Burn Rate", icon: "🔥", description: "Monthly burn rate tracking" },
    { id: "revenue-analytics" as const, name: "Revenue", icon: "💰", description: "Revenue trends & forecasting" },
    { id: "lead-conversion" as const, name: "Lead Conversion", icon: "🎯", description: "Lead funnel analysis" },
    { id: "performance-dashboard" as const, name: "Dashboard", icon: "📊", description: "Performance overview" },
  ];

  const renderChart = () => {
    switch (selectedArtifact) {
      case "burn-rate":
        return <BurnRateChart className="w-full" />;
      case "revenue-analytics":
        return <RevenueAnalyticsChart className="w-full" />;
      case "lead-conversion":
        return <LeadConversionChart className="w-full" />;
      case "performance-dashboard":
        return (
          <div className="space-y-4">
            <BurnRateChart className="w-full" height={300} />
            <RevenueAnalyticsChart className="w-full" height={300} />
            <LeadConversionChart className="w-full" height={300} />
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-text-muted">
            Select an artifact type to view chart data
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Business Analytics Canvas</h2>
        <div className="flex items-center space-x-2">
          {isGenerating && (
            <div className="flex items-center space-x-2 text-brand">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
              <span className="text-sm">Generating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Artifact Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {artifactTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedArtifact(type.id)}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200 text-left",
              selectedArtifact === type.id
                ? "border-brand bg-brand/5 text-brand"
                : "border-border bg-surface hover:bg-surface-elevated text-text"
            )}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{type.icon}</span>
              <div>
                <div className="font-medium text-sm">{type.name}</div>
                <div className="text-xs text-text-muted">{type.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Query Input and Generate Button */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            // This would be controlled by parent component
            // For now, we'll just show the query
          }}
          placeholder="Enter your analytics query (e.g., 'Show me our burn rate for Q4')"
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand"
          disabled={isGenerating}
        />
        <button
          onClick={() => generateArtifact(selectedArtifact, query)}
          disabled={isGenerating || !query.trim()}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-surface rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="p-3 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">Generation Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{generationError}</p>
        </div>
      )}

      {/* Chart Container */}
      <div className="bg-surface border border-border rounded-lg p-4 min-h-[400px]">
        {renderChart()}
      </div>

      {/* Artifact Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {artifactTypes.map((type) => {
          const artifact = artifacts[type.id.replace("-", "") as keyof typeof artifacts];
          return (
            <div
              key={type.id}
              className={cn(
                "p-2 rounded border text-center",
                artifact?.data
                  ? "border-green-200 bg-green-50 text-green-800"
                  : artifact?.isStreaming
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-gray-200 bg-gray-50 text-gray-600"
              )}
            >
              <div className="font-medium">{type.name}</div>
              <div>
                {artifact?.data ? "✅ Ready" : 
                 artifact?.isStreaming ? "🔄 Streaming" : 
                 "⏳ Waiting"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}