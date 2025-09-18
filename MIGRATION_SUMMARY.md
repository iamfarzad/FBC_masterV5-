# AI SDK Migration Summary

## Executive summary
The branch `feature/ai-sdk-backend-hardening` replaces the legacy chat presentation layer with AI Element components and routes all chat traffic through the AI SDK-backed `/api/chat/unified` endpoint. The work unifies customer and admin chat experiences, introduces shared selector-style hooks, and removes the old `components/chat/layouts/*` stack. Several follow-on items (Zustand store, feature toggles, richer metadata) remain open.

## Delivered
- `AiElementsConversation` now renders every chat surface (public v2 page and admin assistant), providing consistent markdown, suggestions, action buttons, and streaming loaders.
- `useUnifiedChat` integrates with Gemini via `@ai-sdk/google`'s `streamText` helper and mirrors state into `@ai-sdk-tools/store` so consumers can subscribe with `useUnifiedChatMessages`, `useUnifiedChatStatus`, and `useUnifiedChatError`.
- `UnifiedChatActionsProvider` exposes `addMessage`, `sendMessage`, and `updateContext` so multimodal tools (screen share, webcam, ROI tests) push responses through the same pipeline.
- Stage context is synced from intelligence responses (`syncStageFromIntelligence`) and reflected in the shared `StageRail` component and diagnostics panel.
- Decommissioned the bespoke `ChatMessages`, `ChatLayout`, and `UnifiedMessage` components in favour of the AI Elements stack; linting now runs cleanly.

## Outstanding
- No `/api/chat/simple` route, `useSimpleAISDK` hook, or feature toggles exist; `useUnifiedChat` remains the only implementation.
- `/api/chat/unified` currently emits cumulative text plus minimal metadata. Reasoning traces, tool/task payloads, and citations need to be added so the UI sections can light up.
- Chat state still lives inside the hook; migrating to a dedicated Zustand slice (or similar) would allow true global mutations and tooling support.
- Debug tooling is limited to the lightweight `UnifiedChatDebugPanel`; the planned devtools dashboard was not built.

## Recommended next steps
1. Extend `/api/chat/unified` to stream structured metadata (reasoning, tools, tasks, citations) and update the mapper to preserve it.
2. Extract chat state into a shared store module, replacing the hook-managed `useState` usage and enabling multi-session control.
3. Introduce feature flags or configuration gates if we still need to support staged rollouts or legacy fallbacks.
4. Update automated tests (or add new smoke coverage) for the SSE mapper and tool integrations.
5. Refresh the migration plan once these gaps close, then schedule removal of any remaining legacy provider code.
