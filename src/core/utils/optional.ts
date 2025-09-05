export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as Partial<T>;
}

// simple type guard if you need it elsewhere
export const defined = <T>(x: T | undefined | null): x is T => x !== undefined && x !== null;
