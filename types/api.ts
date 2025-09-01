export interface ActionResponse<T = unknown> { ok: boolean; output?: T; error?: string; citations?: { uri: string; title?: string }[] }

