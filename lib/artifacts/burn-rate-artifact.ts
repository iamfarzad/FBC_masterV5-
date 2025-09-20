import { artifact } from "@ai-sdk-tools/artifacts";
import { z } from "zod";

/**
 * Burn Rate Artifact - CanvasJS Chart Integration
 * Defines the structure for burn rate visualization with real-time data
 */
export const burnRateArtifact = artifact(
  "burn-rate",
  z.object({
    chart: z.object({
      title: z.object({
        text: z.string(),
        fontColor: z.string().optional(),
        fontSize: z.number().optional(),
      }),
      axisX: z.object({
        title: z.string(),
        gridColor: z.string().optional(),
        lineColor: z.string().optional(),
      }),
      axisY: z.object({
        title: z.string(),
        prefix: z.string().optional(),
        gridColor: z.string().optional(),
        lineColor: z.string().optional(),
      }),
      data: z.array(
        z.object({
          type: z.enum(["splineArea", "line", "column", "bar"]),
          name: z.string(),
          showInLegend: z.boolean().optional(),
          color: z.string().optional(),
          lineColor: z.string().optional(),
          lineThickness: z.number().optional(),
          lineDashType: z.enum(["solid", "dash", "dot"]).optional(),
          dataPoints: z.array(
            z.object({
              x: z.union([z.string(), z.number(), z.date()]),
              y: z.number(),
              label: z.string().optional(),
              toolTipContent: z.string().optional(),
            })
          ),
        })
      ),
      toolTip: z.object({
        shared: z.boolean().optional(),
        contentFormatter: z.string().optional(),
      }).optional(),
      legend: z.object({
        verticalAlign: z.enum(["top", "bottom", "center"]).optional(),
        horizontalAlign: z.enum(["left", "right", "center"]).optional(),
        fontSize: z.number().optional(),
        fontColor: z.string().optional(),
      }).optional(),
    }),
    metrics: z.object({
      current: z.object({
        label: z.string(),
        value: z.number(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        color: z.string().optional(),
      }),
      average: z.object({
        label: z.string(),
        value: z.number(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        color: z.string().optional(),
      }),
      change: z.object({
        label: z.string(),
        value: z.number(),
        percentage: z.number(),
        trend: z.enum(["up", "down", "stable"]),
        color: z.string().optional(),
      }),
    }),
    summary: z.string(),
    timeframe: z.string(),
    lastUpdated: z.string(),
  })
);

/**
 * Revenue Analytics Artifact
 * For revenue tracking and forecasting charts
 */
export const revenueAnalyticsArtifact = artifact(
  "revenue-analytics",
  z.object({
    chart: z.object({
      title: z.object({
        text: z.string(),
        fontColor: z.string().optional(),
      }),
      axisX: z.object({
        title: z.string(),
        valueFormatString: z.string().optional(),
      }),
      axisY: z.object({
        title: z.string(),
        prefix: z.string().optional(),
      }),
      data: z.array(
        z.object({
          type: z.enum(["line", "column", "spline", "area"]),
          name: z.string(),
          color: z.string().optional(),
          dataPoints: z.array(
            z.object({
              x: z.union([z.string(), z.number(), z.date()]),
              y: z.number(),
              label: z.string().optional(),
            })
          ),
        })
      ),
    }),
    metrics: z.object({
      total: z.object({
        label: z.string(),
        value: z.number(),
        prefix: z.string().optional(),
      }),
      growth: z.object({
        label: z.string(),
        value: z.number(),
        percentage: z.number(),
        trend: z.enum(["up", "down", "stable"]),
      }),
      forecast: z.object({
        label: z.string(),
        value: z.number(),
        confidence: z.enum(["high", "medium", "low"]),
      }),
    }),
    summary: z.string(),
    timeframe: z.string(),
  })
);

/**
 * Lead Conversion Artifact
 * For lead funnel and conversion rate visualization
 */
export const leadConversionArtifact = artifact(
  "lead-conversion",
  z.object({
    chart: z.object({
      title: z.object({
        text: z.string(),
      }),
      data: z.array(
        z.object({
          type: z.enum(["funnel", "pie", "doughnut", "pyramid"]),
          name: z.string(),
          dataPoints: z.array(
            z.object({
              y: z.number(),
              name: z.string(),
              color: z.string().optional(),
              toolTipContent: z.string().optional(),
            })
          ),
        })
      ),
    }),
    metrics: z.object({
      totalLeads: z.object({
        label: z.string(),
        value: z.number(),
      }),
      conversionRate: z.object({
        label: z.string(),
        value: z.number(),
        percentage: z.number(),
      }),
      qualifiedLeads: z.object({
        label: z.string(),
        value: z.number(),
      }),
    }),
    summary: z.string(),
    timeframe: z.string(),
  })
);

/**
 * Performance Dashboard Artifact
 * Multi-chart dashboard for overall business metrics
 */
export const performanceDashboardArtifact = artifact(
  "performance-dashboard",
  z.object({
    charts: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(["burn-rate", "revenue", "leads", "custom"]),
        chart: z.object({
          title: z.object({
            text: z.string(),
          }),
          data: z.array(
            z.object({
              type: z.string(),
              name: z.string(),
              dataPoints: z.array(
                z.object({
                  x: z.union([z.string(), z.number(), z.date()]),
                  y: z.number(),
                  label: z.string().optional(),
                })
              ),
            })
          ),
        }),
      })
    ),
    overallMetrics: z.object({
      health: z.enum(["excellent", "good", "fair", "poor"]),
      score: z.number().min(0).max(100),
      recommendations: z.array(z.string()),
    }),
    summary: z.string(),
    lastUpdated: z.string(),
  })
);

// Export all artifacts for easy importing
export const artifacts = {
  burnRate: burnRateArtifact,
  revenueAnalytics: revenueAnalyticsArtifact,
  leadConversion: leadConversionArtifact,
  performanceDashboard: performanceDashboardArtifact,
} as const;

export type ArtifactTypes = keyof typeof artifacts;