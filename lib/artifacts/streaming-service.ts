import { google } from "@ai-sdk/google";
import { streamText, generateObject } from "ai";
import { z } from "zod";
import { 
  burnRateArtifact,
  revenueAnalyticsArtifact,
  leadConversionArtifact,
  performanceDashboardArtifact 
} from "./burn-rate-artifact";

/**
 * AI Model for generating chart data
 */
const model = google("gemini-1.5-pro-latest");

/**
 * Streaming Service for Artifacts
 * Generates real-time chart data using AI
 */
export class ArtifactStreamingService {
  /**
   * Generate Burn Rate Chart Data
   */
  static async generateBurnRateData(query: string, context?: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a business analytics AI that generates burn rate visualization data.

Generate realistic burn rate data based on the user's query. Include:
- Current monthly burn rate
- Historical data for the last 12 months
- Average burn rate
- Trend analysis
- Business context and recommendations

Use realistic business data that would make sense for a startup or business.
Format all numbers appropriately (e.g., currency, percentages).
Provide actionable insights in the summary.`,
        prompt: `Generate burn rate chart data for: ${query}

Context: ${context ? JSON.stringify(context) : 'No additional context'}

Create a comprehensive burn rate analysis with:
1. Monthly burn rate data for the last 12 months
2. Current vs average comparison
3. Trend analysis (up/down/stable)
4. Business recommendations
5. Professional summary`,
        schema: z.object({
          chart: z.object({
            title: z.object({
              text: z.string(),
              fontColor: z.string().optional(),
            }),
            axisX: z.object({
              title: z.string(),
              gridColor: z.string().optional(),
            }),
            axisY: z.object({
              title: z.string(),
              prefix: z.string().optional(),
            }),
            data: z.array(
              z.object({
                type: z.enum(["splineArea", "line"]),
                name: z.string(),
                showInLegend: z.boolean().optional(),
                color: z.string().optional(),
                lineColor: z.string().optional(),
                dataPoints: z.array(
                  z.object({
                    x: z.string(),
                    y: z.number(),
                    label: z.string().optional(),
                  })
                ),
              })
            ),
          }),
          metrics: z.object({
            current: z.object({
              label: z.string(),
              value: z.number(),
              prefix: z.string().optional(),
              color: z.string().optional(),
            }),
            average: z.object({
              label: z.string(),
              value: z.number(),
              prefix: z.string().optional(),
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
        }),
        temperature: 0.7,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating burn rate data:", error);
      throw new Error("Failed to generate burn rate data");
    }
  }

  /**
   * Generate Revenue Analytics Data
   */
  static async generateRevenueData(query: string, context?: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a revenue analytics AI that generates revenue visualization data.

Generate realistic revenue data based on the user's query. Include:
- Monthly revenue trends
- Growth rates and forecasts
- Revenue breakdown by category
- Business insights and recommendations

Use realistic business revenue data that would make sense for various business types.
Format all numbers appropriately (currency, percentages).
Provide actionable business insights.`,
        prompt: `Generate revenue analytics chart data for: ${query}

Context: ${context ? JSON.stringify(context) : 'No additional context'}

Create a comprehensive revenue analysis with:
1. Monthly revenue data for the last 12 months
2. Revenue growth rate and trend
3. Revenue forecast with confidence level
4. Business insights and recommendations
5. Professional summary`,
        schema: z.object({
          chart: z.object({
            title: z.object({
              text: z.string(),
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
                type: z.enum(["line", "column", "spline"]),
                name: z.string(),
                color: z.string().optional(),
                dataPoints: z.array(
                  z.object({
                    x: z.string(),
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
        }),
        temperature: 0.7,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating revenue data:", error);
      throw new Error("Failed to generate revenue data");
    }
  }

  /**
   * Generate Lead Conversion Data
   */
  static async generateLeadConversionData(query: string, context?: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a lead conversion analytics AI that generates lead funnel visualization data.

Generate realistic lead conversion data based on the user's query. Include:
- Lead funnel stages and conversion rates
- Total leads and qualified leads
- Conversion metrics and insights
- Recommendations for improvement

Use realistic lead conversion data that would make sense for various business types.
Format all numbers appropriately (percentages, counts).
Provide actionable lead generation insights.`,
        prompt: `Generate lead conversion chart data for: ${query}

Context: ${context ? JSON.stringify(context) : 'No additional context'}

Create a comprehensive lead conversion analysis with:
1. Lead funnel data with conversion rates
2. Total leads and qualified leads metrics
3. Conversion rate analysis
4. Lead generation insights and recommendations
5. Professional summary`,
        schema: z.object({
          chart: z.object({
            title: z.object({
              text: z.string(),
            }),
            data: z.array(
              z.object({
                type: z.enum(["funnel", "pie", "doughnut"]),
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
        }),
        temperature: 0.7,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating lead conversion data:", error);
      throw new Error("Failed to generate lead conversion data");
    }
  }

  /**
   * Generate Performance Dashboard Data
   */
  static async generatePerformanceDashboard(query: string, context?: any) {
    try {
      const result = await generateObject({
        model,
        system: `You are a business performance analytics AI that generates comprehensive dashboard data.

Generate realistic performance dashboard data based on the user's query. Include:
- Multiple key performance indicators
- Overall business health score
- Actionable recommendations
- Trend analysis across different metrics

Use realistic business performance data that would make sense for various business types.
Format all numbers appropriately.
Provide comprehensive business insights.`,
        prompt: `Generate performance dashboard data for: ${query}

Context: ${context ? JSON.stringify(context) : 'No additional context'}

Create a comprehensive performance dashboard with:
1. Multiple chart types (burn rate, revenue, leads, etc.)
2. Overall business health assessment
3. Performance score (0-100)
4. Actionable recommendations
5. Professional summary`,
        schema: z.object({
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
                        x: z.string(),
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
        }),
        temperature: 0.7,
      });

      return result.object;
    } catch (error) {
      console.error("Error generating performance dashboard:", error);
      throw new Error("Failed to generate performance dashboard");
    }
  }

  /**
   * Stream Artifact Data
   */
  static async streamArtifact(artifactType: string, query: string, context?: any) {
    let data;
    
    switch (artifactType) {
      case "burn-rate":
        data = await this.generateBurnRateData(query, context);
        return burnRateArtifact.stream(data);
      
      case "revenue-analytics":
        data = await this.generateRevenueData(query, context);
        return revenueAnalyticsArtifact.stream(data);
      
      case "lead-conversion":
        data = await this.generateLeadConversionData(query, context);
        return leadConversionArtifact.stream(data);
      
      case "performance-dashboard":
        data = await this.generatePerformanceDashboard(query, context);
        return performanceDashboardArtifact.stream(data);
      
      default:
        throw new Error(`Unknown artifact type: ${artifactType}`);
    }
  }
}