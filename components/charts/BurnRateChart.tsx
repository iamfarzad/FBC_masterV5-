"use client";

import { CanvasJSChart } from "@canvasjs/react-charts";
import { useBurnRateArtifact } from "@/lib/artifacts/artifact-hooks";
import { cn } from "@/src/core/utils";

interface BurnRateChartProps {
  className?: string;
  height?: number;
  showMetrics?: boolean;
}

export function BurnRateChart({ 
  className, 
  height = 400,
  showMetrics = true 
}: BurnRateChartProps) {
  const { data, isStreaming, error } = useBurnRateArtifact();

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
          <span className="text-text-muted">Loading burn rate data...</span>
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
    exportFileName: "Burn Rate Chart",
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
          {/* Current Burn Rate */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.current.label}</p>
                <p className="text-2xl font-bold text-text">
                  {data.metrics.current.prefix || ""}
                  {data.metrics.current.value.toLocaleString()}
                  {data.metrics.current.suffix || ""}
                </p>
              </div>
              {data.metrics.current.color && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.metrics.current.color }}
                />
              )}
            </div>
          </div>

          {/* Average Burn Rate */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.average.label}</p>
                <p className="text-2xl font-bold text-text">
                  {data.metrics.average.prefix || ""}
                  {data.metrics.average.value.toLocaleString()}
                  {data.metrics.average.suffix || ""}
                </p>
              </div>
              {data.metrics.average.color && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.metrics.average.color }}
                />
              )}
            </div>
          </div>

          {/* Change Indicator */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.change.label}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-text">
                    {data.metrics.change.trend === "up" ? "↗" : 
                     data.metrics.change.trend === "down" ? "↘" : "→"}
                    {data.metrics.change.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: data.metrics.change.color || 
                    (data.metrics.change.trend === "up" ? "#ef4444" : 
                     data.metrics.change.trend === "down" ? "#10b981" : "#6b7280")
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Summary</h4>
        <p className="text-text-muted text-sm leading-relaxed">{data.summary}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Timeframe: {data.timeframe}</span>
          <span>Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
        </div>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="fixed bottom-4 right-4 bg-brand text-surface px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-surface rounded-full"></div>
          <span className="text-sm font-medium">Updating chart data...</span>
        </div>
      )}
    </div>
  );
}