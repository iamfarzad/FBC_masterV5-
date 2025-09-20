"use client";

import { CanvasJSChart } from "@canvasjs/react-charts";
import { useLeadConversionArtifact } from "@/lib/artifacts/artifact-hooks";
import { cn } from "@/src/core/utils";

interface LeadConversionChartProps {
  className?: string;
  height?: number;
  showMetrics?: boolean;
}

export function LeadConversionChart({ 
  className, 
  height = 400,
  showMetrics = true 
}: LeadConversionChartProps) {
  const { data, isStreaming, error } = useLeadConversionArtifact();

  if (error) {
    return (
      <div className={cn("p-4 border border-red-200 rounded-lg bg-red-50", className)}>
        <h3 className="text-red-800 font-semibold">Chart Error</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("p-4 border border-border rounded-lg bg-surface", className)}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand border-t-transparent"></div>
          <span className="text-text-muted">Loading lead conversion data...</span>
        </div>
      </div>
    );
  }

  const chartOptions = {
    ...data.chart,
    height: height,
    backgroundColor: "transparent",
    animationEnabled: true,
    exportEnabled: true,
    exportFileName: "Lead Conversion Funnel",
    theme: "light2",
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Chart Container */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <CanvasJSChart options={chartOptions} />
      </div>

      {/* Metrics Section */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Leads */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.totalLeads.label}</p>
                <p className="text-2xl font-bold text-brand">
                  {data.metrics.totalLeads.value.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                <span className="text-brand font-bold text-lg">👥</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.conversionRate.label}</p>
                <p className="text-2xl font-bold text-text">
                  {data.metrics.conversionRate.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-text-muted">
                  {data.metrics.conversionRate.value} conversions
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">📈</span>
              </div>
            </div>
          </div>

          {/* Qualified Leads */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.qualifiedLeads.label}</p>
                <p className="text-2xl font-bold text-text">
                  {data.metrics.qualifiedLeads.value.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">
                  {((data.metrics.qualifiedLeads.value / data.metrics.totalLeads.value) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">✅</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Lead Conversion Analysis</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Timeframe: {data.timeframe}</span>
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Updating lead data...</span>
        </div>
      )}
    </div>
  );
}