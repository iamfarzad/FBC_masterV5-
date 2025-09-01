#!/bin/bash
echo "🧹 F.B/c Codebase Cleanup Script - Phase 1"
echo "=========================================="

# Function to log progress
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Track stats
STATS_FILE="/tmp/cleanup-stats.txt"
echo "Cleanup Statistics" > "$STATS_FILE"
echo "==================" >> "$STATS_FILE"

# Phase 1: Critical Fixes
log "🚨 PHASE 1: Critical Fixes Starting"

# 1. Remove duplicate hook files (safe to delete - identical content)
log "Removing duplicate hook files..."
if [ -f "hooks/ui/use-auto-resize-textarea.ts" ]; then
    rm -f hooks/ui/use-auto-resize-textarea.ts
    echo "✅ Removed: hooks/ui/use-auto-resize-textarea.ts" >> "$STATS_FILE"
fi

if [ -f "components/ui/use-mobile.tsx" ]; then
    rm -f components/ui/use-mobile.tsx
    echo "✅ Removed: components/ui/use-mobile.tsx" >> "$STATS_FILE"
fi

if [ -f "components/ui/use-toast.ts" ]; then
    rm -f components/ui/use-toast.ts
    echo "✅ Removed: components/ui/use-toast.ts" >> "$STATS_FILE"
fi

# 2. Remove duplicate API utils (safe to delete - identical content)
log "Removing duplicate API utilities..."
if [ -f "app/api-utils/admin-monitoring-core.ts" ]; then
    rm -f app/api-utils/admin-monitoring-core.ts
    echo "✅ Removed: app/api-utils/admin-monitoring-core.ts" >> "$STATS_FILE"
fi

if [ -f "app/api-utils/api-withAdminAuth.ts" ]; then
    rm -f app/api-utils/api-withAdminAuth.ts
    echo "✅ Removed: app/api-utils/api-withAdminAuth.ts" >> "$STATS_FILE"
fi

if [ -f "app/api-utils/api-withApiGuard.ts" ]; then
    rm -f app/api-utils/api-withApiGuard.ts
    echo "✅ Removed: app/api-utils/api-withApiGuard.ts" >> "$STATS_FILE"
fi

if [ -f "app/api-utils/security-rate-limiting.ts" ]; then
    rm -f app/api-utils/security-rate-limiting.ts
    echo "✅ Removed: app/api-utils/security-rate-limiting.ts" >> "$STATS_FILE"
fi

# 3. Remove empty files (safe to delete)
log "Removing empty files..."
if [ -f "types/supabase.ts" ] && [ ! -s "types/supabase.ts" ]; then
    rm -f types/supabase.ts
    echo "✅ Removed empty: types/supabase.ts" >> "$STATS_FILE"
fi

# 4. Fix incomplete lib/ to src/ migrations (careful approach)
log "Fixing lib/ to src/ import migrations..."

# ChatArea.tsx - fix specific imports
if [ -f "components/chat/ChatArea.tsx" ]; then
    sed -i 's|@/lib/services/tool-service|@/src/services/tools/index|g' components/chat/ChatArea.tsx
    echo "✅ Fixed: components/chat/ChatArea.tsx - tool-service import" >> "$STATS_FILE"
fi

# SystemHealthDashboard.tsx
if [ -f "components/admin/SystemHealthDashboard.tsx" ]; then
    sed -i 's|@/lib/utils|@/src/core/utils|g' components/admin/SystemHealthDashboard.tsx
    echo "✅ Fixed: components/admin/SystemHealthDashboard.tsx - utils import" >> "$STATS_FILE"
fi

# PersistentChatDockConnected.tsx
if [ -f "components/collab/PersistentChatDockConnected.tsx" ]; then
    sed -i 's|@/lib/icon-mapping|@/src/core/icon-mapping|g' components/collab/PersistentChatDockConnected.tsx
    echo "✅ Fixed: components/collab/PersistentChatDockConnected.tsx - icon-mapping import" >> "$STATS_FILE"
fi

# ErrorBoundary.tsx
if [ -f "components/ErrorBoundary.tsx" ]; then
    sed -i 's|@/lib/utils|@/src/core/utils|g' components/ErrorBoundary.tsx
    echo "✅ Fixed: components/ErrorBoundary.tsx - utils import" >> "$STATS_FILE"
fi

# Hook files
if [ -f "hooks/use-video-to-app-detection.ts" ]; then
    sed -i 's|@/lib/youtube-url-detection|@/src/core/youtube|g' hooks/use-video-to-app-detection.ts
    echo "✅ Fixed: hooks/use-video-to-app-detection.ts - youtube import" >> "$STATS_FILE"
fi

if [ -f "hooks/use-real-time-activities.ts" ]; then
    sed -i 's|@/lib/supabase/client|@/src/core/supabase/client|g' hooks/use-real-time-activities.ts
    echo "✅ Fixed: hooks/use-real-time-activities.ts - supabase import" >> "$STATS_FILE"
fi

if [ -f "hooks/useMediaPlayer.ts" ]; then
    sed -i 's|@/lib/media/MediaService|@/src/services/media/index|g' hooks/useMediaPlayer.ts
    echo "✅ Fixed: hooks/useMediaPlayer.ts - MediaService import" >> "$STATS_FILE"
fi

if [ -f "hooks/use-educational-interactions.ts" ]; then
    sed -i 's|@/lib/educational-gemini-service|@/src/core/educational-gemini-service|g' hooks/use-educational-interactions.ts
    echo "✅ Fixed: hooks/use-educational-interactions.ts - educational-gemini import" >> "$STATS_FILE"
fi

if [ -f "hooks/use-real-time-voice.ts" ]; then
    sed -i 's|@/lib/supabase/client|@/src/core/supabase/client|g' hooks/use-real-time-voice.ts
    echo "✅ Fixed: hooks/use-real-time-voice.ts - supabase import" >> "$STATS_FILE"
fi

if [ -f "hooks/useGeminiLiveAudio.ts" ]; then
    sed -i 's|@/lib/token-usage-logger|@/src/core/token-usage-logger|g' hooks/useGeminiLiveAudio.ts
    echo "✅ Fixed: hooks/useGeminiLiveAudio.ts - token-usage-logger import" >> "$STATS_FILE"
fi

# 5. Clean up console.log statements (development only - careful approach)
log "Cleaning up console.log statements..."

# Count before cleanup
CONSOLE_BEFORE=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "console\." | paste -sd+ | bc)

# Remove console.log, console.warn, console.error (but keep console.error in error handlers)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs sed -i '/console\.log/d'
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs sed -i '/console\.warn/d'

# Count after cleanup
CONSOLE_AFTER=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "console\." | paste -sd+ | bc)

CONSOLE_REMOVED=$((CONSOLE_BEFORE - CONSOLE_AFTER))
echo "✅ Removed: $CONSOLE_REMOVED console statements" >> "$STATS_FILE"

# 6. Clean up commented imports (safe)
log "Cleaning up commented imports..."
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs sed -i '/^\/\/ import.*from/d'

COMMENTED_IMPORTS=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "^// import.*from" | paste -sd+ | bc)
echo "✅ Removed: $COMMENTED_IMPORTS commented imports" >> "$STATS_FILE"

# 7. Check for any broken imports we might have created
log "Checking for potential import issues..."
BROKEN_IMPORTS=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "@/" | paste -sd+ | bc)
echo "ℹ️  Total @/ imports remaining: $BROKEN_IMPORTS" >> "$STATS_FILE"

log "🚨 PHASE 1: Critical Fixes Complete"

# Show summary
echo ""
echo "🎉 CLEANUP COMPLETE!"
echo "==================="
cat "$STATS_FILE"

echo ""
echo "📋 NEXT STEPS:"
echo "1. Test your application to ensure nothing broke"
echo "2. Run: npm run build (or pnpm build)"
echo "3. If successful, proceed to Phase 2 (component splitting)"
echo "4. Address any import errors that may have surfaced"

echo ""
echo "⚠️  IMPORTANT: Check for any TypeScript errors and fix them before committing!"

# Cleanup temp file
rm -f "$STATS_FILE"
