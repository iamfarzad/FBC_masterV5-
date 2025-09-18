# Build Fix Summary – AI SDK chat cleanup

## What broke
During earlier attempts to migrate the chat experience, the branch accumulated references to hooks and routes that never materialised (`useAISDKComplete`, `/api/chat/simple`, etc.). Guard scripts and documentation expected those files, leading to confusion during reviews and build validation.

## What changed on this branch
- `/chat` now redirects to `/chat/v2`, and the v2 page renders conversations with `AiElementsConversation` backed by `useUnifiedChat` and `/api/chat/unified`.
- Legacy chat layout components were removed, leaving the AI Element flow as the sole presentation layer.
- `useUnifiedChat` streams Gemini responses via the AI SDK helpers and mirrors state into `@ai-sdk-tools/store`, exposing selector hooks throughout the UI.
- Tooling panels (screen share, webcam, ROI checks) push their outputs through the shared store using `UnifiedChatActionsProvider`.
- Stage progress updates flow from `syncStageFromIntelligence`, keeping the StageRail and diagnostics cards aligned with the active session.

## What still needs attention
- Missing files/routes mentioned in prior docs (`/api/chat/simple`, `useSimpleAISDK`, etc.) should either be implemented or removed from plans (documentation has now been cleaned to reflect reality).
- `/api/chat/unified` only emits plain text plus minimal metadata; structured tool/task/reasoning data is still on the backlog.
- Chat state continues to live inside `useUnifiedChat`; a dedicated shared store is recommended for future work.

## Next steps
1. Enrich the unified chat endpoint with structured metadata so AI Element components can display reasoning, tools, tasks, and citations.
2. Promote chat state into a dedicated store slice to enable multi-session control outside the hook.
3. Reintroduce guardrails/tests that assert against the actual SoT instead of placeholder artefacts.
