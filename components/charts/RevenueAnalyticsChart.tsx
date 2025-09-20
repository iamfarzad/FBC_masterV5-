"use client";

import { CanvasJSChart } from "@canvasjs/react-charts";
import { useRevenueAnalyticsArtifact } from "@/lib/artifacts/artifact-hooks";
import { cn } from "@/src/core/utils";

interface RevenueAnalyticsChartProps {
  className?: string;
  height?: number;
  showMetrics?: boolean;
}

export function RevenueAnalyticsChart({ 
  className, 
  height = 400,
  showMetrics = true 
}: RevenueAnalyticsChartProps) {
  const { data, isStreaming, error } = useRevenueAnalyticsArtifact();

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
          <span className="text-text-muted">Loading revenue analytics...</span>
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
    exportFileName: "Revenue Analytics",
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
          {/* Total Revenue */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.total.label}</p>
                <p className="text-2xl font-bold text-brand">
                  {data.metrics.total.prefix || "$"}
                  {data.metrics.total.value.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                <span className="text-brand font-bold">$</span>
              </div>
            </div>
          </div>

          {/* Growth Rate */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.growth.label}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-text">
                    {data.metrics.growth.trend === "up" ? "↗" : 
                     data.metrics.growth.trend === "down" ? "↘" : "→"}
                    {data.metrics.growth.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  data.metrics.growth.trend === "up" ? "bg-green-100" :
                  data.metrics.growth.trend === "down" ? "bg-red-100" : "bg-gray-100"
                )}
              >
                <span className={cn(
                  "text-lg font-bold",
                  data.metrics.growth.trend === "up" ? "text-green-600" :
                  data.metrics.growth.trend === "down" ? "text-red-600" : "text-gray-600"
                )}>
                  {data.metrics.growth.trend === "up" ? "↗" : 
                   data.metrics.growth.trend === "down" ? "↘" : "→"}
                </span>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{data.metrics.forecast.label}</p>
                <p className="text-2xl font-bold text-text">
                  {data.metrics.forecast.prefix || "$"}
                  {data.metrics.forecast.value.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted">
                  Confidence: {data.metrics.forecast.confidence}
                </p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                data.metrics.forecast.confidence === "high" ? "bg-blue-100" :
                data.metrics.forecast.confidence === "medium" ? "bg-yellow-100" : "bg-red-100"
              )}>
                <span className={cn(
                  "text-lg font-bold",
                  data.metrics.forecast.confidence === "high" ? "text-blue-600" :
                  data.metrics.forecast.confidence === "medium" ? "text-yellow-600" : "text-red-600"
                )}>
                  📊
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">Revenue Analysis</h4>
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
          <span className="text-sm font-medium">Updating revenue data...</span>
        </div>
      )}
    </div>
  );
}