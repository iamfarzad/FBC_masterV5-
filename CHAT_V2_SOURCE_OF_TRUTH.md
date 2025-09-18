# Chat V2 – Source of Truth Notes

## Current reality
- `/chat` redirects to `/chat/v2`, which is the primary chat experience on this branch.
- The v2 page uses `AiElementsConversation` plus shared panels (control cards, multimodal widget, stage rail) running on top of `useUnifiedChat` and the AI SDK-backed `/api/chat/unified` route.
- The admin assistant now reuses the same component stack, so both surfaces present identical behaviour.

## Shipped pieces
- Legacy `components/chat/layouts/*` have been removed; AI Element primitives are the only render path.
- `useUnifiedChat` streams Gemini responses, mirrors state into `@ai-sdk-tools/store`, and exposes selector hooks for the UI.
- Screen share, webcam capture, ROI tests, and other quick actions push their status messages through `UnifiedChatActionsProvider`, keeping the transcript in sync.
- Stage context is synchronised from intelligence responses so the StageRail reflects current progress automatically.

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
