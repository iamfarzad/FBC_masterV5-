# Source of Truth

This repo contains legacy demos and reference UI fragments under `attached_assets/` and many auto‑generated `Code-component-*` files. They are not part of the production app.

Production chat UI and flow:

- UI: `app/(chat)/chat/ChatShell.tsx`
- Page: `app/(chat)/chat/page.tsx`
- State: `hooks/useAppState.tsx`
- System prompt + provider select: `src/core/ai/index.ts`
- Chat pipeline: `app/api/chat/route.ts` → `src/api/chat/handler.ts` → `src/core/chat/service.ts`
- Auto‑research tools: `app/api/tools/{search,url}`
- Lead research: `app/api/intelligence/lead-research`
- PDF export/email: `app/api/export-summary`, `app/api/send-pdf-summary`

Build/TypeScript exclude:

- `attached_assets/**` and `**/Code-component-*.tsx` are excluded via `tsconfig.json`.

If you need any demo assets, treat `attached_assets/` as archive only. Do not import from there in production code.

