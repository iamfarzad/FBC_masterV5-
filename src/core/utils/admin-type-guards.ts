// Minimal runtime guards for only the fields we touch in admin-context-builder

export type BudgetStatus = 'under' | 'at' | 'over';

export interface LeadRow {
  status?: 'new' | 'engaged' | 'converted' | string;
  score?: number | null;
  email?: string | null;
  name?: string | null;
}

export interface MeetingRow {
  scheduled_at?: string | null;
  status?: 'scheduled' | 'completed' | 'cancelled' | string;
}

export interface EmailRow {
  status?: 'active' | 'sent' | string;
  opened_count?: number | null;
  clicked_count?: number | null;
  bounced_count?: number | null;
}

export interface TokenUsageRow {
  tokens_used?: number | null;
  cost?: number | null;
  model?: string | null;
  feature?: string | null;
}

export interface InteractionRow {
  duration?: number | null;
}

export interface AIMetricRow {
  feature?: 'chat' | 'image-analysis' | 'document-analysis' | 'voice-processing' | string | null;
}

export function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object';
}

export function arrOf<T>(v: unknown, guard: (x: unknown) => x is T): T[] {
  return Array.isArray(v) ? v.filter(guard) : [];
}

export const isLead    = (v: unknown): v is LeadRow => isObj(v);
export const isMeeting = (v: unknown): v is MeetingRow => isObj(v);
export const isEmail   = (v: unknown): v is EmailRow => isObj(v);
export const isToken   = (v: unknown): v is TokenUsageRow => isObj(v);
export const isInter   = (v: unknown): v is InteractionRow => isObj(v);
export const isAIM     = (v: unknown): v is AIMetricRow => isObj(v);

export function nz(n: number | null | undefined, d = 0): number {
  return typeof n === 'number' && !Number.isNaN(n) ? n : d;
}

export function normalizeBudgetStatus(s: unknown): BudgetStatus {
  if (s === 'under' || s === 'at' || s === 'over') return s;
  return 'at';
}
