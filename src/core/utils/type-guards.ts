// src/core/utils/type-guards.ts
export type BudgetStatus = 'under' | 'at' | 'over';

export const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

export const isArray = <T = unknown>(v: unknown, itemGuard?: (x: unknown) => x is T): v is T[] =>
  Array.isArray(v) && (itemGuard ? v.every(itemGuard) : true);

export const safeNumber = (v: unknown, d = 0): number =>
  (typeof v === 'number' && Number.isFinite(v)) ? v : d;

export const safeString = (v: unknown, d = ''): string =>
  (typeof v === 'string') ? v : d;

export const hasKey = <K extends string>(o: unknown, k: K): o is Record<K, unknown> =>
  isObject(o) && k in o;

// Domain-ish guards you can widen later
export interface LeadLike {
  status?: string; score?: number; email?: string; name?: string;
}
export const isLeadLike = (v: unknown): v is LeadLike =>
  isObject(v) && (typeof v.status === 'string' || typeof v.score === 'number' ||
  typeof v.email === 'string' || typeof v.name === 'string');

export interface MeetingLike {
  scheduled_at?: string; status?: string;
}
export const isMeetingLike = (v: unknown): v is MeetingLike =>
  isObject(v) && ('scheduled_at' in v || 'status' in v);

export interface TokenUsageLike {
  model?: string; feature?: string; tokens_used?: number; cost?: number;
}
export const isTokenUsageLike = (v: unknown): v is TokenUsageLike =>
  isObject(v) && ('tokens_used' in v || 'cost' in v || 'model' in v || 'feature' in v);

export function normalizeBudgetStatus(s: unknown): BudgetStatus {
  if (s === 'under' || s === 'at' || s === 'over') return s;
  return 'at';
}