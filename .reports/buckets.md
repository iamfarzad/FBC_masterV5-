# TypeScript Error Buckets (Baseline)

- **Total Errors:** 711

---

- **Bucket A — Supabase typed as `unknown`:** ~150 errors
  - Errors related to the Supabase client being untyped, causing issues with `.from("table")` calls and general query type safety.

- **Bucket B — `exactOptionalPropertyTypes` violations:** 66 errors
  - Errors where object shapes do not strictly match the target type, often due to optional properties being handled incorrectly.

- **Bucket C — Tool/Chat type mismatches:** ~50 errors
  - Type errors related to `ChatRequest`, `ToolResult`, and other core chat/tooling interfaces.

- **Bucket D — Live/Realtime API mismatches:** ~20 errors
  - Errors in `gemini-live` and related hooks due to incorrect assumptions about the Live API surface (`getSessionContext`, `sendRealtimeInput`).

- **Bucket E — Bad API usage:** 24 errors
  - Incorrect function argument counts, usage of deprecated properties like `NextRequest.ip`, and unsafe `Buffer.from` calls.

- **Bucket F — Missing imports / undefined identifiers & Other:** ~401 errors
  - A broad category for missing variables, components, modules, and other type errors not covered above.
