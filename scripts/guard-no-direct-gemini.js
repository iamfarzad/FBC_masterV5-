#!/usr/bin/env node

/**
 * 🚨 GUARD AGAINST DIRECT GEMINI API CALLS
 * Prevents regressions by ensuring all Gemini API calls go through the unified adapter
 */

const { readFileSync, readdirSync } = require("fs");
const path = require("path");

const files = [];

// Recursively find all TypeScript/JavaScript files
function walk(dir) {
  try {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);

      // Skip node_modules and other common directories
      if (f.name === 'node_modules' || f.name === '.git' || f.name === 'dist' || f.name === 'build') {
        continue;
      }

      if (f.isDirectory()) {
        walk(p);
      } else if (/\.(ts|tsx|js|jsx)$/.test(f.name)) {
        files.push(p);
      }
    }
  } catch (error) {
    // Skip directories we can't read
    return;
  }
}

// Start from project root
walk("src");
walk("app");
walk("components");
walk("hooks");
walk("lib");

const bad = files.filter(p => {
  try {
    const s = readFileSync(p, "utf8");

    // Check for direct Gemini API calls outside the unified adapter
    const hasDirectGeminiCall = /@google\/genai|models\.generate/i.test(s);

    // Allow direct calls in these infrastructure areas:
    const isAllowedInfrastructure = /unified-provider|gemini-adapter|fbc-inject|embeddings|config\/safety|educational-gemini-service|intelligence\/providers|src\/core\/live/i.test(p);

    // Block direct calls in user-facing components and hooks
    const isUserFacingComponent = /components\/|hooks\/|app\/.*page\.|app\/.*layout\./i.test(p);

    return hasDirectGeminiCall && !isAllowedInfrastructure && isUserFacingComponent;
  } catch (error) {
    // Skip files we can't read
    return false;
  }
});

if (bad.length) {
  console.error("❌ DIRECT GEMINI API CALLS FOUND (use unified adapter):\n");
  bad.forEach(file => {
    console.error(`  ❌ ${file}`);
  });
  console.error("\n🔧 FIX: Use unifiedChatProvider.generate() instead of direct Gemini API calls");
  console.error("📖 See: src/core/chat/unified-provider.ts for the correct pattern");
  process.exit(1);
}

console.log("✅ No direct Gemini API calls detected - unified system integrity maintained.");

// Also check for legacy hook usage
const legacyHookUsage = files.filter(p => {
  try {
    const s = readFileSync(p, "utf8");
    return /useConversationalIntelligence|useRealtimeChat\(|useChat\(|\/api\/ai-stream|\/api\/gemini-live|\/api\/multimodal/i.test(s) &&
           !/DEPRECATED|compatibility|shim/i.test(s);
  } catch (error) {
    return false;
  }
});

if (legacyHookUsage.length) {
  console.warn("⚠️  LEGACY HOOK/API USAGE DETECTED:\n");
  legacyHookUsage.forEach(file => {
    console.warn(`  ⚠️  ${file}`);
  });
  console.warn("\n🔄 MIGRATE: Use useUnifiedChat and /api/chat/unified instead");
  console.warn("📅 These should be migrated during the deprecation window");
  // Don't exit with error for legacy usage during migration window
}

console.log("✅ Guard checks completed successfully.");
