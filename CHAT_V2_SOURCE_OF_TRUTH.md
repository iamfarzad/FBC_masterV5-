# Chat V2 – Source of Truth Notes

## Current reality (UPDATED - AI SDK Tools Restored)
- `/chat` redirects to `/chat/v2`, which is the primary chat experience on this branch.
- The v2 page uses the shared pipeline in `app/(chat)/chat/v2/page.tsx` together with `UnifiedChatWithFlags` to pick between **THREE IMPLEMENTATION MODES**:
  - **Unified Mode**: `useUnifiedChat` (streaming via `/api/chat/unified`)
  - **AI SDK Tools Mode**: `useUnifiedChatV2`/`useNativeAISDK` (feature-flag driven)
  - **Simple Mode**: `useSimpleAISDK` (non-streaming fallback hitting `/api/chat/simple`)
- All modes push lifecycle state into `src/core/chat/state/unified-chat-store.ts`, so selector hooks and devtools stay in sync.
- The admin assistant reuses the same component stack, giving parity with the customer experience.

## Shipped pieces (UPDATED)
- Legacy `components/chat/layouts/*` have been removed; AI Element primitives are the only render path.
- **THREE CHAT IMPLEMENTATIONS** available:
  - `useUnifiedChat` - Custom Zustand store with local state management
  - `useUnifiedChatV2` - **RESTORED** AI SDK Tools pattern with global state management
  - `useSimpleAISDK` - Simple fallback implementation
- Unified and native modes stream Gemini responses through `/api/chat/unified`, while the simple mode calls `/api/chat/simple`; all three sync into the shared selector hooks for the UI.
- Screen share, webcam capture, ROI tests, and other quick actions push their status messages through `UnifiedChatActionsProvider`, keeping the transcript in sync.
- Stage context is synchronised from intelligence responses so the StageRail reflects current progress automatically.
- **RESTORED**: `ChatDevtools` component provides real-time debugging for AI SDK Tools mode.

## Gaps to watch
- `useUnifiedChat` still stubs regenerate/resume/tool-result behaviour, and the native hook’s reload/stop helpers remain placeholders.
- Automated coverage has not been added for SSE parsing, feature-flag selection, or metadata rendering.
- The Chat Devtools overlay is available, but the deeper performance dashboard referenced in early plans is still future work.
- Realtime/multimodal/admin API variants beyond `/api/chat/unified` continue to rely on legacy handlers.

## Focus for completion
1. Wire regenerate/resume/tool-result flows through the hooks and backend so recovery tooling works end-to-end.
2. Add automated coverage around SSE parsing, metadata propagation, and feature-flag routing.
3. Build out the performance/debug dashboard originally scoped for the AI SDK rollout.
4. Evaluate remaining legacy realtime/multimodal handlers and plan upgrades onto the unified AI SDK stack.
