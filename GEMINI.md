# FBC_masterV5 — Analysis and Cleanup Plan

## GLOBAL RULE:
- Always keep `intelligenceService` and similar core services as NAMED exports.
- Do not create default exports for them.
- If imports are broken, update the import statements instead of changing the export style.
- Apply this rule consistently across all files before making any edits.


## Before editing any service file:

1. Search for all `import` statements that reference it.
2. Confirm whether the codebase expects a named or default export.
3. Use the majority pattern as the single source of truth.
4. Update only the mismatched imports.

## Scope
Perform a full repo analysis and refactor. Backend and frontend.

## Workflow
- Work phase by phase.
- Show progress after each phase.
- Ask before any breaking change.
- Keep stability and backward compatibility.
- Follow established patterns and coding standards.
- Test after each significant change.

## Phase 1: Codebase Analysis
1. File structure
   - Map full tree.
   - Document architecture and patterns.
2. Dependencies
   - Review all package.json files.
   - Flag unused deps, version conflicts, security issues.
3. Imports/exports
   - Detect circular deps.
   - Standardize import styles.
   - Fix missing/incorrect exports.
4. Configuration
   - Review next.config.mjs, tailwind.config.ts, tsconfig.json, eslint, env handling.

## Phase 2: File-by-File Code Review (order)
- Core config files
- Types and interfaces
- Utilities and helpers
- React pages, then components
- API routes and server functions
- Hooks and custom logic
- Styles and themes

For each file:
- Syntax and type checks
- Code quality
- Performance
- Security
- Documentation

## Phase 3: Function Review
For each function/method:
- Parameter validation and types
- Error handling
- Performance risks
- Duplication
- Best practices

## Phase 4: Cleanup and Refactor
1. Remove dead code (imports, vars, functions, files)
2. Consolidate duplicate logic
3. Standardize patterns (naming, folders, imports, error shapes)
4. Performance fixes where needed
5. Improve type safety (no `any`)
6. Update docs (JSDoc where useful)

## Phase 5: Testing and Validation
1. Build: `pnpm build`
2. Lint: `pnpm lint`
3. Types: `pnpm tsc --noEmit`
4. Tests: run and fix failures
5. Integration: verify critical user flows

## Phase 6: Final Optimization
1. Bundle size review
2. Dependency cleanup and updates
3. Code splitting where it helps
4. Caching for static assets
5. SEO and performance audits

## Requirements
- Do not break existing behavior
- Keep API contracts
- Preserve UX
- Maintain or improve performance
- Follow security best practices
- Respect current architecture

## Criteria for Best Version
1. Recent stable code (last 2 weeks, tests passing)
2. Complete working features merged
3. Clean architecture
4. Fast implementations
5. Security-first approach
6. Strong TypeScript typing
7. Useful documentation
Always cross-check duplicates
Many files exist in different shapes across main, clean-production-ready, and feature/*. 
	•	Summarize differences (params, types, error handling, performance).
	•	Recommend one canonical implementation.
	•	Only then propose the edit.

## Feature Priorities (top to bottom)
1. Intelligence pipeline (chat, AI)
2. Multimodal (video, audio, image)
3. Realtime (WebSocket, live)
4. UI (responsive, accessible)
5. API integrations
6. Tools
7. Testing infra

## Branch Order for Analysis
1. main
2. cursor/comprehensive-main-branch-cleanup-and-restoration-ed4d
3. clean-production-ready
4. feature/v0-integration
5. Archive branches (only for missing pieces)

## External Sources if Needed
- /Users/farzad/FB-c_labV2
- /Users/farzad/FB-c_labV3-main
- /Users/farzad/fbc_v4

## Immediate Action
- Fix `intelligenceService` import:
  - Update `src/core/intelligence/index.ts` to export the service instance correctly.

## Reporting
- After each phase, post a short summary:
  - What changed
  - Open risks
  - Next steps

## Commit Policy
- Small, atomic commits
- Clear messages




