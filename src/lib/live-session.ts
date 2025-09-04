export type LiveSessionLike = unknown;

export function asLiveSessionLike(x: unknown): LiveSessionLike {
  // narrow or adapt; throw if incompatible
  return {} as LiveSessionLike;
}
