#!/bin/bash
# 🔄 IMPORT UPDATE SCRIPT
# Update all import statements to use consolidated components

set -e

echo "🔄 Updating import statements..."

# Update imports from legacy tool locations to tools/ versions
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs sed -i '' \
  -e 's|@/components/chat/ROICalculator|@/components/chat/tools/ROICalculator|g' \
  -e 's|@/components/chat/ScreenShare|@/components/chat/tools/ScreenShare|g' \
  -e 's|@/components/chat/WebcamCapture|@/components/chat/tools/WebcamCapture|g'

# Update ChatHeader imports to use main version (not layouts)
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs sed -i '' \
  -e 's|@/components/chat/layouts/ChatHeader|@/components/chat/ChatHeader|g'

# Update ErrorBoundary imports to use enhanced version
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs sed -i '' \
  -e 's|@/components/error-boundary|@/components/ErrorBoundary|g'

echo "✅ Import updates complete!"
echo "🔍 Verifying no broken imports..."
echo "Files with potential import issues:"
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs grep -l "from.*ROICalculator\|from.*ScreenShare\|from.*WebcamCapture" | grep -v "tools/" || echo "None found - good!"
