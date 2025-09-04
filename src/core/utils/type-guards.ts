/** Minimal guard helpers to safely narrow `unknown` */
export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function hasKey<T extends string>(obj: unknown, key: T): obj is Record<T, unknown> {
  return isRecord(obj) && key in obj;
}

export function asString(x: unknown): string | undefined {
  return typeof x === "string" ? x : undefined;
}
