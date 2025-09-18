# AI SDK Migration – Current Status

## Snapshot
- Unified chat surfaces (customer and admin) now render through `AiElementsConversation`, giving us consistent message markup, suggestions, and tool/task placeholders.
- `useUnifiedChat` sends traffic to `/api/chat/unified`, which streams Gemini output via the AI SDK helpers. The hook mirrors its state into `@ai-sdk-tools/store`, so selectors such as `useUnifiedChatMessages` work anywhere in the tree.
- Both chat shells share supporting context: stage tracking, multimodal widgets, tool actions, and the light debug panel that reflects store status.
- Legacy `components/chat/layouts/*` and the old `UnifiedMessage` renderer have been removed on this branch, so the AI Element flow is the only UI path.

## Delivered so far
- Replaced the bespoke chat message stack with AI Element primitives (`Conversation`, `Message`, `Response`, `Suggestions`, etc.).
- Centralised chat state exposure via `src/core/chat/state/unified-chat-store.ts`, providing selector-style hooks (`useUnifiedChatMessages`, `useUnifiedChatStatus`, `useUnifiedChatError`).
- Wired `/api/chat/unified` to Gemini through `@ai-sdk/google`'s `streamText`, returning incremental SSE chunks to the browser.
- Added `UnifiedChatActionsProvider` so shell features (screen share, webcam capture, ROI helpers) can push messages through the same pipeline.
- Synced stage and capability metadata: `syncStageFromIntelligence` keeps the StageRail and progress cards aligned with streaming updates.
- Restored lint cleanliness – `pnpm lint` passes without warnings.

## Still missing
- There is no `/api/chat/simple` route, `useSimpleAISDK` hook, or toggle-driven multi-implementation flow. `useUnifiedChat` remains the single source of truth.
- The AI SDK stream only emits text plus minimal metadata. Reasoning traces, tool payloads, tasks, and citations are not surfaced yet, so the richer UI sections stay empty.
- Chat state still lives inside the hook and is mirrored into the external store; we have not promoted a first-class Zustand slice that other code can mutate directly.
- Feature flags and UI toggles for switching implementations were never built.
- Several documents (including this one) previously referenced future layers that do not exist. Those references have been removed.

## Technical notes
- **API**: `/api/chat/unified` (Node runtime) wraps `streamText` from `@ai-sdk/google`, applies the configured Gemini model, and streams SSE events. It currently returns cumulative assistant text plus a small metadata payload.
- **Hook**: `hooks/useUnifiedChat.ts` owns request lifecycle, handles aborts, and mirrors its state into the AI SDK store via `syncUnifiedChatStoreState`. Consumers subscribe through selector hooks rather than prop drilling.
- **Renderer**: `components/chat/AiElementsConversation.tsx` maps `UnifiedMessage` data into richer UI: avatars, streaming loader, suggestions, tool/task scaffolding, and source blocks. It uses `mapUnifiedMessagesToAiMessages` for the shape conversion.
- **Shared UI**: `CleanInputField`, `UnifiedMultimodalWidget`, `ScreenShare`, and `WebcamCapture` now report back into the unified chat store so their outputs appear in the transcript.
- **Admin parity**: `components/admin/AdminAssistantPanel.tsx` consumes the same stack, ensuring the admin assistant matches the public chat behaviour.

## Known gaps to close
1. Enrich `/api/chat/unified` so it emits reasoning, tool, task, and citation metadata that the AI Elements UI can render.
2. Extract chat state into a durable Zustand slice (or equivalent) instead of keeping `useUnifiedChat` as the only authority.
3. Introduce guarded feature toggles if layered rollouts are still desired (legacy vs tools vs pure AI SDK).
4. Add regression coverage (unit and smoke) for the mapper and SSE handling.
5. Hook auxiliary tools (uploads, ROI, admin analytics) into real AI SDK flows instead of stubbing messages.

## Next steps
- Prioritise the data-model work (metadata + store refactor) so the UI surfaces match the design intent.
- Once the missing layers land, update the migration docs again and schedule deletion of any remaining legacy providers.
- Keep future documentation grounded in shipped behaviour to avoid confusion about phantom features.
