#!/bin/bash
# 🚀 COMPONENT CONSOLIDATION SCRIPT
# Execute this script to clean up duplicate components

set -e

echo "🧹 Starting Component Consolidation..."

# 1. BACKUP CURRENT STATE
echo "📦 Creating backup..."
mkdir -p .backup/components-$(date +%Y%m%d_%H%M%S)
cp -r components .backup/components-$(date +%Y%m%d_%H%M%S)/

# 2. REMOVE LEGACY TOOL COMPONENTS (KEEP ENHANCED TOOLS/ VERSIONS)
echo "🗑️  Removing legacy tool components..."
rm -rf components/chat/ROICalculator/
rm -rf components/chat/ScreenShare/
rm -rf components/chat/WebcamCapture/

# 3. REMOVE BASIC CHAT HEADER (KEEP ADVANCED MAIN VERSION)
echo "🗑️  Removing basic ChatHeader..."
rm -f components/chat/layouts/ChatHeader.tsx

# 4. KEEP UNIFIED CHAT HEADER (SPECIFIC USE CASE)
echo "✅ Keeping unified ChatHeader for unified platform"

# 5. KEEP ENHANCED ERRORBOUNDARY (MORE FEATURES)
echo "🗑️  Removing basic error-boundary.tsx..."
rm -f components/error-boundary.tsx

# 6. KEEP ALL BOOKCALLBUTTON VARIANTS (LEGITIMATE VARIANTS)
echo "✅ Keeping all BookCallButton variants (legitimate use cases)"

echo "🎉 Consolidation complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Run: ./update-imports.sh"
echo "2. Run: pnpm build"
echo "3. Test functionality"
echo "4. Commit changes"
