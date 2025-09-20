import { useArtifact } from "@ai-sdk-tools/artifacts";
import { 
  burnRateArtifact,
  revenueAnalyticsArtifact,
  leadConversionArtifact,
  performanceDashboardArtifact,
  artifacts
} from "./burn-rate-artifact";

/**
 * Hook for Burn Rate Artifact
 * Provides real-time burn rate data and chart configuration
 */
export function useBurnRateArtifact() {
  return useArtifact(burnRateArtifact);
}

/**
 * Hook for Revenue Analytics Artifact
 * Provides revenue tracking and forecasting data
 */
export function useRevenueAnalyticsArtifact() {
  return useArtifact(revenueAnalyticsArtifact);
}

/**
 * Hook for Lead Conversion Artifact
 * Provides lead funnel and conversion data
 */
export function useLeadConversionArtifact() {
  return useArtifact(leadConversionArtifact);
}

/**
 * Hook for Performance Dashboard Artifact
 * Provides multi-chart dashboard data
 */
export function usePerformanceDashboardArtifact() {
  return useArtifact(performanceDashboardArtifact);
}

/**
 * Generic Artifact Hook Factory
 * Creates a hook for any artifact type
 */
export function useArtifactHook<T extends keyof typeof artifacts>(artifactType: T) {
  return useArtifact(artifacts[artifactType]);
}

/**
 * Hook to get all available artifacts
 */
export function useAllArtifacts() {
  return {
    burnRate: useBurnRateArtifact(),
    revenueAnalytics: useRevenueAnalyticsArtifact(),
    leadConversion: useLeadConversionArtifact(),
    performanceDashboard: usePerformanceDashboardArtifact(),
  };
}

/**
 * Hook for artifact streaming status
 */
export function useArtifactStreamingStatus() {
  const burnRate = useBurnRateArtifact();
  const revenueAnalytics = useRevenueAnalyticsArtifact();
  const leadConversion = useLeadConversionArtifact();
  const performanceDashboard = usePerformanceDashboardArtifact();

  return {
    isStreaming: {
      burnRate: burnRate.isStreaming,
      revenueAnalytics: revenueAnalytics.isStreaming,
      leadConversion: leadConversion.isStreaming,
      performanceDashboard: performanceDashboard.isStreaming,
    },
    hasData: {
      burnRate: !!burnRate.data,
      revenueAnalytics: !!revenueAnalytics.data,
      leadConversion: !!leadConversion.data,
      performanceDashboard: !!performanceDashboard.data,
    },
    errors: {
      burnRate: burnRate.error,
      revenueAnalytics: revenueAnalytics.error,
      leadConversion: leadConversion.error,
      performanceDashboard: performanceDashboard.error,
    },
  };
}