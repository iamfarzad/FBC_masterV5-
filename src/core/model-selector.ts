/**
 * Model Selection Utility for Gemini Models
 * Helps choose the optimal model based on use case requirements
 */

import { getConfig } from './config';

export interface ModelSelection {
  model: string;
  estimatedCost: number;
}

/**
 * Simple scoring that maps feature → preferred model bucket,
 * then falls back to defaults found in config.
 * Keep this minimal and deterministic.
 */
function scoreModelsForFeature(
  feature: string,
  capabilities: Record<string, unknown>,
  estimatedTokens?: number
): Array<{ model: string; score: number }> {
  // Map features to model buckets exposed in config.ai.gemini.models
  const bucketByFeature: Record<string, keyof ReturnType<typeof getConfig>['ai']['gemini']['models']> = {
    chat: 'default',
    text_generation: 'default',
    research: 'research',
    analysis: 'analysis',
    document_analysis: 'analysis',
    image_analysis: 'analysis',
    fast: 'fastResponse',
  };

  const cfg = getConfig();
  const models = cfg.ai.gemini.models;

  // Decide a candidate list ordered by preference
  const pickBucket = bucketByFeature[feature] ?? 'default';
  const candidates: string[] = Array.from(
    new Set([
      models[pickBucket],
      models.default,
      models.fastResponse,
      models.analysis,
      models.research,
    ].filter(Boolean))
  );

  // Token-aware nudge: if extremely large, prefer analysis/research first
  const bigJob = typeof estimatedTokens === 'number' && estimatedTokens > 100_000;
  const ordered = bigJob
    ? Array.from(new Set([models.analysis, models.research, ...candidates])).filter(Boolean) as string[]
    : candidates;

  return ordered.map((m, i) => ({ model: m, score: 100 - i }));
}

/** Public API used by services */
export function selectModelForFeature(
  feature: string,
  estimatedTokens?: number,
  _hasSession?: boolean
): ModelSelection {
  const cfg = getConfig();
  const capabilities = (cfg as any)?.ai?.gemini?.modelCapabilities ?? {};
  const scored = scoreModelsForFeature(feature, capabilities, estimatedTokens);
  const chosen = (scored[0]?.model) || cfg.ai.gemini.models.default;

  // Centralized pricing (if present)
  const pricing: Record<string, number> = (cfg as any)?.ai?.gemini?.pricing ?? {};
  const ppm = pricing[chosen]; // price per million tokens
  const est =
    typeof ppm === 'number' && typeof estimatedTokens === 'number'
      ? (estimatedTokens / 1_000_000) * ppm
      : 0;

  return { model: chosen, estimatedCost: est };
}
