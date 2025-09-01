"use client"

export const SYSTEM_KEYWORDS = [
  'system', 'health', 'status', 'performance', 'memory', 'cache',
  'streaming', 'storage', 'browser', 'error', 'crash', 'slow',
  'fast', 'working', 'doing', 'comprehensive', 'overview'
]

// 🔍 DETECT SYSTEM STATUS QUERIES
export function isSystemStatusQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return SYSTEM_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// 📊 FORMAT SYSTEM STATUS RESPONSE
export function formatSystemStatusResponse(data: any): string {
  if (!data.success) {
    return `❌ System Status Error: ${data.error || 'Unable to retrieve system status'}`
  }

  const { answer, metrics, recommendations, severity } = data

  let formattedResponse = `## 🔧 System Status Report\n\n${answer}\n\n`

  // Add key metrics if available
  if (metrics && Object.keys(metrics).length > 0) {
    formattedResponse += `### 📈 Key Metrics\n`
    if (metrics.healthScore) {
      formattedResponse += `• **Health Score:** ${metrics.healthScore}/100\n`
    }
    if (metrics.memoryUsage) {
      formattedResponse += `• **Memory Usage:** ${metrics.memoryUsage}MB\n`
    }
    if (metrics.activeStreams) {
      formattedResponse += `• **Active Streams:** ${metrics.activeStreams}\n`
    }
    if (metrics.cacheHitRate) {
      formattedResponse += `• **Cache Hit Rate:** ${metrics.cacheHitRate}%\n`
    }
    if (metrics.responseTime) {
      formattedResponse += `• **Avg Response Time:** ${metrics.responseTime}ms\n`
    }
    formattedResponse += `\n`
  }

  // Add recommendations if available
  if (recommendations && recommendations.length > 0) {
    formattedResponse += `### 💡 Recommendations\n`
    recommendations.forEach((rec: string, index: number) => {
      formattedResponse += `${index + 1}. ${rec}\n`
    })
    formattedResponse += `\n`
  }

  // Add severity indicator
  if (severity) {
    const severityEmoji = severity === 'critical' ? '🚨' :
                         severity === 'high' ? '⚠️' :
                         severity === 'medium' ? '🟡' : '✅'
    formattedResponse += `### 🚨 Severity Level: ${severityEmoji} ${severity.toUpperCase()}\n\n`
  }

  // Add timestamp
  formattedResponse += `---\n*Report generated at ${new Date().toLocaleString()}*`

  return formattedResponse
}

// 🔧 SYSTEM STATUS PROMPTS
export const SYSTEM_STATUS_PROMPTS = {
  health: "Provide a comprehensive system health report including performance metrics, memory usage, cache status, and any active alerts",
  performance: "Analyze system performance metrics and provide optimization recommendations",
  memory: "Check memory usage patterns and identify potential memory leaks or optimization opportunities",
  cache: "Review cache performance, hit rates, and suggest cache optimization strategies",
  errors: "Scan for system errors, crashes, or anomalies and provide troubleshooting guidance"
}
