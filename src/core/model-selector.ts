/**
 * Model Selection Utility for Gemini Models
 * Helps choose the optimal model based on use case requirements
 */

import { config } from './config'

export type UseCase =
  | 'chat'           // General chat interactions
  | 'translation'    // Translation tasks (latency-sensitive)
  | 'classification' // Classification tasks (latency-sensitive)
  | 'research'       // Deep research and analysis
  | 'image_analysis' // Image processing
  | 'audio_processing' // Audio/voice processing
  | 'high_volume'    // High-volume operations
  | 'creative_writing' // Creative content generation
  | 'code_generation' // Programming assistance
  | 'data_analysis'  // Data processing and insights
  | 'summarization'  // Text summarization tasks

export type ModelRequirements = {
  prioritizeLatency?: boolean    // Need fastest response time
  prioritizeCost?: boolean      // Need lowest cost
  prioritizeQuality?: boolean   // Need highest quality output
  requiresMultimodal?: boolean  // Needs image/audio support
  highVolume?: boolean         // High request volume
  longContext?: boolean        // Needs large context window
  budget?: number              // Max budget per request (in USD)
  maxTokens?: number           // Expected response length
}

/**
 * Estimate token count for text (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Select model for specific feature/use case - SIMPLIFIED RELIABLE VERSION
 * Returns object with model selection details (compatible with multimodal APIs)
 */
export function selectModelForFeature(feature: string, estimatedTokens: number, hasSession?: boolean): {
  model: string
  estimatedCost?: number
  reason?: string
} {
  const inputCost = 0.075 // Cost per 1M input tokens for gemini-2.5-flash
  const outputCost = 0.30 // Cost per 1M output tokens for gemini-2.5-flash
  const estimatedOutputTokens = estimatedTokens * 0.8 // Rough estimate

  const estimatedCost = ((estimatedTokens / 1_000_000) * inputCost) + ((estimatedOutputTokens / 1_000_000) * outputCost)

  // SIMPLE: Always use default model - this works reliably for multimodal
  return {
    model: config.ai.gemini.models.default,
    estimatedCost,
    reason: 'Using reliable default model for multimodal functionality'
  }
}

/**
 * Legacy function for backward compatibility
 */
export function selectModelForFeatureLegacy(useCase: UseCase, requirements: ModelRequirements = {}): string {
  return ModelSelector.selectModel(useCase, requirements)
}

export class ModelSelector {
  /**
   * Select optimal Gemini model based on use case and requirements
   * Uses advanced scoring algorithm considering cost, quality, latency, and capabilities
   */
  static selectModel(useCase: UseCase, requirements: ModelRequirements = {}): string {
    const capabilities = config.ai.gemini.modelCapabilities
    const models = config.ai.gemini.models

    // Extract requirements
    const {
      prioritizeLatency,
      prioritizeCost,
      prioritizeQuality,
      requiresMultimodal,
      highVolume,
      longContext,
      budget,
      maxTokens = 1000
    } = requirements

    // Calculate expected cost for different models
    const calculateCost = (modelName: string, inputTokens: number, outputTokens: number): number => {
      const modelCap = capabilities[modelName]
      if (!modelCap) return Infinity

      const inputCost = (inputTokens / 1000000) * modelCap.pricing.input
      const outputCost = (outputTokens / 1000000) * modelCap.pricing.output
      return inputCost + outputCost
    }

    // Score models based on requirements
    const scoreModel = (modelName: string): { model: string; score: number; cost: number } => {
      const modelCap = capabilities[modelName]
      if (!modelCap) return { model: modelName, score: -Infinity, cost: Infinity }

      let score = 0
      const estimatedCost = calculateCost(modelName, 1000, maxTokens)

      // Cost optimization
      if (prioritizeCost) {
        score += (1 / estimatedCost) * 100 // Lower cost = higher score
      }

      // Quality optimization
      if (prioritizeQuality) {
        if (modelName.includes('pro')) score += 50
        if (modelCap.contextWindow >= 2097152) score += 30 // Prefer larger context
      }

      // Latency optimization
      if (prioritizeLatency) {
        if (modelName.includes('flash-lite') || modelName.includes('flash-8b')) score += 40
      }

      // Multimodal requirements
      if (requiresMultimodal && modelCap.multimodal) {
        score += 20
      }

      // Context window requirements
      if (longContext && modelCap.contextWindow >= 2097152) {
        score += 25
      }

      // High volume optimization
      if (highVolume && modelName.includes('flash-lite')) {
        score += 15
      }

      // Budget constraints
      if (budget && estimatedCost > budget) {
        score -= 100 // Heavy penalty for exceeding budget
      }

      // Use case specific scoring
      switch (useCase) {
        case 'chat':
          if (modelName.includes('flash')) score += 10
          break
        case 'research':
        case 'data_analysis':
        case 'creative_writing':
          if (modelName.includes('pro')) score += 20
          if (modelCap.contextWindow >= 2097152) score += 15
          break
        case 'translation':
        case 'classification':
          if (prioritizeLatency) score += 15
          break
        case 'image_analysis':
        case 'audio_processing':
          if (modelCap.multimodal) score += 30
          break
        case 'code_generation':
          if (modelName.includes('pro')) score += 15
          break
        case 'high_volume':
          if (modelName.includes('flash-lite') || modelName.includes('flash-8b')) score += 25
          break
        case 'creative_writing':
          if (modelName.includes('pro')) score += 25
          break
        case 'summarization':
          if (modelName.includes('flash')) score += 10
          break
      }

      return { model: modelName, score, cost: estimatedCost }
    }

    // Get all available models and score them
    const modelNames = Object.values(models)
    const scoredModels = modelNames.map(scoreModel)

    // Sort by score (descending) and return best model
    scoredModels.sort((a, b) => b.score - a.score)

    console.log('🤖 Model Selection Results:', {
      useCase,
      requirements,
      topModels: scoredModels.slice(0, 3).map(m => ({
        model: m.model,
        score: Math.round(m.score),
        cost: `$${m.cost.toFixed(4)}`
      }))
    })

    return scoredModels[0].model
  }

  /**
   * Legacy model selection for backward compatibility
   * @deprecated Use selectModel instead
   */
  static selectModelLegacy(useCase: UseCase, requirements: ModelRequirements = {}): string {
    const { prioritizeLatency, prioritizeCost, highVolume } = requirements

    // For high-volume or cost-sensitive operations, prefer current cost-effective model
    if (prioritizeCost || highVolume) {
      return config.ai.gemini.models.default // gemini-2.5-flash (cheaper)
    }

    // For latency-sensitive operations, consider Flash-Lite
    if (prioritizeLatency) {
      switch (useCase) {
        case 'translation':
        case 'classification':
        case 'chat': // Only for real-time chat where latency is critical
          return config.ai.gemini.models.fastResponse // gemini-2.5-flash-lite
        default:
          return config.ai.gemini.models.default
      }
    }

    // Default model selection by use case
    switch (useCase) {
      case 'image_analysis':
        return config.ai.gemini.models.analysis // gemini-1.5-flash

      case 'research':
        return config.ai.gemini.models.research // gemini-2.5-flash

      case 'translation':
      case 'classification':
        // These benefit from Flash-Lite's speed, but only if latency is prioritized
        return prioritizeLatency
          ? config.ai.gemini.models.fastResponse
          : config.ai.gemini.models.default

      case 'audio_processing':
        // Flash-Lite has 40% lower audio costs
        return config.ai.gemini.models.fastResponse
      
      case 'chat':
      case 'high_volume':
      default:
        return config.ai.gemini.models.default // Most cost-effective
    }
  }

  /**
   * Get cost comparison between models for given token usage
   */
  static getCostComparison(inputTokens: number, outputTokens: number) {
    const models = [
      { name: 'gemini-2.5-flash', input: 0.075, output: 0.30 },
      { name: 'gemini-2.5-flash-lite', input: 0.10, output: 0.40 },
    ]

    return models.map(model => ({
      model: model.name,
      inputCost: (inputTokens / 1_000_000) * model.input,
      outputCost: (outputTokens / 1_000_000) * model.output,
      totalCost: ((inputTokens / 1_000_000) * model.input) + ((outputTokens / 1_000_000) * model.output)
    }))
  }

  /**
   * Recommend when to use Flash-Lite
   */
  static shouldUseFlashLite(useCase: UseCase, requirements: ModelRequirements = {}): {
    recommended: boolean
    reason: string
  } {
    const { prioritizeLatency, prioritizeCost, highVolume } = requirements

    // Don't recommend if cost is prioritized
    if (prioritizeCost || highVolume) {
      return {
        recommended: false,
        reason: "Current gemini-2.5-flash is 25% cheaper for both input and output tokens"
      }
    }

    // Recommend for latency-sensitive operations
    if (prioritizeLatency) {
      switch (useCase) {
        case 'translation':
        case 'classification':
          return {
            recommended: true,
            reason: "Flash-Lite is optimized for low-latency translation and classification tasks"
          }
        case 'audio_processing':
          return {
            recommended: true,
            reason: "Flash-Lite has 40% lower audio input costs and faster processing"
          }
        default:
          return {
            recommended: false,
            reason: "For this use case, the speed improvement may not justify the 33% cost increase"
          }
      }
    }

    return {
      recommended: false,
      reason: "Stick with current gemini-2.5-flash for better cost efficiency"
    }
  }
}
