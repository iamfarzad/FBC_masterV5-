// Small helpers used below. Pure TS, no runtime deps.
export const isDefined = <T>(v: T | undefined | null): v is T => v !== undefined && v !== null;

export const asString = (v: unknown, d = ''): string => typeof v === 'string' ? v : d;

export const omitUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as Partial<T>;
};
