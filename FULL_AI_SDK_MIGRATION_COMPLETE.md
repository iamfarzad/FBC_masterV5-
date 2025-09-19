# AI SDK Migration – Current Status

## Snapshot
- Customer chat and the admin assistant both render through the AI Elements shell, powered by the shared pipeline in `app/(chat)/chat/v2/page.tsx` and `components/chat/UnifiedChatWithFlags.tsx`.
- `useUnifiedChat`, `useSimpleAISDK`, and `useNativeAISDK` all call the AI SDK backed `/api/chat/unified` (or `/api/chat/simple` for the fallback) and mirror their lifecycle into the local Zustand store exposed by `src/core/chat/state/unified-chat-store.ts`.
- Feature-flag helpers in `src/core/feature-flags/ai-sdk-migration.ts` let us toggle between implementations and metadata tiers without code changes.
- Legacy layout stacks remain removed – AI Element components are the only rendering path.

## Delivered so far
- Ai Elements Conversation + Native AI SDK Conversation components handle every transcript, supplying tool, reasoning, task, and citation UI where metadata exists.
- `/api/chat/unified` streams Gemini responses via `streamText`, enriches the final chunk with reasoning/tasks/citations, and exposes AI SDK tool invocations; `/api/chat/simple` offers the non-streaming fallback.
- `useUnifiedChat`, `useSimpleAISDK`, and `useNativeAISDK` share a consistent interface while syncing into the unified chat store for selectors and devtools support.
- Feature flags (`shouldUseNativeAISDK`, `shouldUseNativeTools`, etc.) decide whether we serve the legacy pipeline, the native AI SDK experience, or fall back automatically.
- Multimodal helpers (screen share, webcam, ROI) continue to post into the shared store so transcripts stay aligned with auxiliary tools.

## Still missing
- `useUnifiedChat` exposes `regenerate`, `resumeStream`, and `addToolResult` as stubs, so the UI cannot yet trigger those actions without further backend work.
- The native AI SDK hook’s `reload`/`stop` helpers are placeholders and do not reconnect an interrupted stream automatically.
- End-to-end and unit coverage for the SSE parsers, tool mappers, and feature-flag routing remains to be written.
- Performance dashboards/devtools are limited to the lightweight Chat Devtools overlay; deeper analytics remain on the backlog.

## Technical notes
- **API**: `/api/chat/unified` (Node runtime) wraps `streamText` from `@ai-sdk/google`, accumulates streamed text, and emits a metadata-rich completion event that includes reasoning, task, citation, and tool invocation payloads. `/api/chat/simple` mirrors the prompt into a single `generateText` call for fallbacks.
- **Hooks**: `useUnifiedChat`, `useSimpleAISDK`, `useNativeAISDK`, and the global `useUnifiedChatStore` variant share a consistent contract while pushing state into the unified chat store so selector hooks work anywhere in the tree.
- **Feature flags**: `src/core/feature-flags/ai-sdk-migration.ts` coordinates admin/user/session rollouts, enhanced metadata, native tool enablement, and debug logging.
- **Renderers**: `AiElementsConversation` and `NativeAISDKConversation` surface reasoning, tool summaries, tasks, sources, and annotations alongside streaming responses.
- **Shared UI**: Clean input, multimodal widgets, and the booking/document flows all publish through the chat actions context to keep transcripts and stage rails synchronised.

## Known gaps to close
1. Flesh out regenerate/stop workflows in the hooks so transcripts can recover from errors without a full page reset.
2. Harden the SSE parsing utilities and add automated coverage around tool and annotation mapping.
3. Expand the Chat Devtools experience with performance metrics and feature-flag inspection for production rollouts.
4. Audit auxiliary tool integrations to ensure long-running uploads/actions surface progress and errors through the unified metadata channel.

## Next steps
- Wire the regenerate/resume handlers through the hooks and API so recovery actions function end-to-end.
- Add automated coverage around SSE parsing, feature-flag routing, and tool metadata rendering.
- Expand Chat Devtools (or successor dashboards) with production-friendly telemetry before broad rollout.
- Keep future documentation grounded in shipped behaviour to avoid confusion about phantom features.
