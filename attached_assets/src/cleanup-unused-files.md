# 🗑️ Files to Delete - Unused App Versions

## Alternative App Versions (DELETE THESE)
- BookingTest.tsx
- BookingTestApp.tsx  
- CleanWorkingApp.tsx
- DesignTest.tsx
- PerfectLayoutApp.tsx
- TrueCompletePerfectApp.tsx
- UltimateComponentShowcase.tsx
- WorkingPerfectApp.tsx

## Duplicate/Test Files (DELETE THESE)
- src-app-layout.tsx
- src-app-page.tsx
- src-components-AILeadGenerationApp.tsx
- migrate-to-nextjs.sh
- migration-guide.md

## Keep These Core Files
✅ App.tsx (main component)
✅ app/layout.tsx
✅ app/page.tsx
✅ All components/* files
✅ All hooks/* files  
✅ All constants/* files
✅ All services/* files
✅ styles/globals.css

## Commands to Clean Up
```bash
# Remove unused app versions
rm BookingTest.tsx BookingTestApp.tsx CleanWorkingApp.tsx DesignTest.tsx
rm PerfectLayoutApp.tsx TrueCompletePerfectApp.tsx UltimateComponentShowcase.tsx WorkingPerfectApp.tsx

# Remove duplicate/test files
rm src-app-*.tsx migrate-to-nextjs.sh migration-guide.md

# Optional: Remove documentation files if not needed
rm AI_ELEMENTS_INTEGRATION_GUIDE.md Attributions.md pnpm-setup-guide.md setup-instructions.md
```