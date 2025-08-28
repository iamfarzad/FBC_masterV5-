#!/bin/bash

# Fix Next.js routes-manifest.json error
# This script cleans the build cache and regenerates the manifest

echo "🧹 Cleaning Next.js build cache..."
rm -rf .next node_modules/.cache
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

echo "🔄 Regenerating routes-manifest.json..."
pnpm build > /dev/null 2>&1

echo "✅ Routes manifest fixed!"
echo ""
echo "🚀 To prevent this issue in the future:"
echo "   Use: pnpm dev:clean (instead of pnpm dev)"
echo "   Or:  pnpm dev:all:clean (instead of pnpm dev:all)"
echo ""
echo "Your server should now work without ENOENT errors!"
