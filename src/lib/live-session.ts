export interface LiveSessionLike {
  // add only the members you use; implement or no-op safely
  // example:
  // sendInput?(data: ArrayBuffer): Promise<void>;
}

export function asLiveSessionLike(x: unknown): LiveSessionLike {
  // narrow or adapt; throw if incompatible
  return {} as LiveSessionLike;
}
