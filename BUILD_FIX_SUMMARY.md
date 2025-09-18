# Build Fix Summary – AI SDK chat cleanup

## What broke
During earlier attempts to migrate the chat experience, the branch accumulated references to hooks and routes that never materialised (`useAISDKComplete`, `/api/chat/simple`, etc.). Guard scripts and documentation expected those files, leading to confusion during reviews and build validation.

## What changed on this branch
- `/chat` now redirects to `/chat/v2`, and the v2 page renders conversations with `AiElementsConversation` backed by `useUnifiedChat` and `/api/chat/unified`.
- Legacy chat layout components were removed, leaving the AI Element flow as the sole presentation layer.
- `useUnifiedChat` streams Gemini responses via the AI SDK helpers and syncs state into `src/core/chat/state/unified-chat-store.ts`, exposing selector hooks throughout the UI.
- Tooling panels (screen share, webcam, ROI checks) push their outputs through the shared store using `UnifiedChatActionsProvider`.
- Stage progress updates flow from `syncStageFromIntelligence`, keeping the StageRail and diagnostics cards aligned with the active session.

## What still needs attention
- `useUnifiedChat` continues to expose stubbed `regenerate`, `resumeStream`, and `addToolResult` helpers, so recovery tooling remains limited.
- Automated coverage for the SSE parser, metadata mapping, and feature-flag routing has not been written.
- Chat Devtools exists, but the deeper performance dashboard originally envisioned is still outstanding.

## Next steps
1. Wire up regenerate/resume/tool-result handlers so recovery and tooling paths are fully functional.
2. Add automated coverage for SSE parsing, metadata propagation, and feature-flag routing.
3. Expand devtools/telemetry to monitor rollout health and surface chat performance metrics.
