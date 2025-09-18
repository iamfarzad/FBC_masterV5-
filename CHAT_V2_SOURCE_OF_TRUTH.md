# Chat V2 – Source of Truth Notes

## Current reality (UPDATED - AI SDK Tools Restored)
- `/chat` redirects to `/chat/v2`, which is the primary chat experience on this branch.
- The v2 page uses `AiElementsConversation` plus shared panels (control cards, multimodal widget, stage rail) running on top of **THREE IMPLEMENTATION MODES**:
  - **Custom Mode**: `useUnifiedChat` with custom Zustand store
  - **AI SDK Tools Mode**: `useUnifiedChatV2` with restored AI SDK Tools pattern
  - **Simple Mode**: `useSimpleAISDK` with fallback implementation
- All modes use the AI SDK-backed `/api/chat/unified` route.
- The admin assistant now reuses the same component stack, so both surfaces present identical behaviour.

## Shipped pieces (UPDATED)
- Legacy `components/chat/layouts/*` have been removed; AI Element primitives are the only render path.
- **THREE CHAT IMPLEMENTATIONS** available:
  - `useUnifiedChat` - Custom Zustand store with local state management
  - `useUnifiedChatV2` - **RESTORED** AI SDK Tools pattern with global state management
  - `useSimpleAISDK` - Simple fallback implementation
- All implementations stream Gemini responses through `/api/chat/unified` and expose selector hooks for the UI.
- Screen share, webcam capture, ROI tests, and other quick actions push their status messages through `UnifiedChatActionsProvider`, keeping the transcript in sync.
- Stage context is synchronised from intelligence responses so the StageRail reflects current progress automatically.
- **RESTORED**: `ChatDevtools` component provides real-time debugging for AI SDK Tools mode.

## Missing pieces (previously claimed but not present)
- No `/api/chat/simple` or alternate implementation hooks (`useAISDKComplete`, `useSimpleAISDK`, etc.).
- No layered feature toggles or localStorage flags to switch between implementations.
- No Gemini intelligence routes beyond `/api/chat/unified`; realtime/multimodal/admin endpoints still rely on legacy handlers.
- Advanced devtools UI, performance analytics, and full tool ecosystems described in earlier drafts have not been built.

## Focus for completion
1. Extend `/api/chat/unified` to stream structured metadata (reasoning, tool/task payloads, citations) so `AiElementsConversation` can show more than plain text.
2. Promote chat state into a dedicated store slice to reduce duplication between the hook and the AI SDK store.
3. Decide whether multiple implementations or toggles are still required; if not, remove lingering references from planning docs.
4. Expand automated coverage (integ/unit smoke) around the SSE mapper and tool triggers to protect the new SoT.
