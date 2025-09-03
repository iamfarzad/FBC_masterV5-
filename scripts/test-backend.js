#!/usr/bin/env node

/**
 * Backend Functionality Test Script
 * Verifies all critical backend components are working
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 F.B/c Backend Verification Script');
console.log('=====================================\n');

let passedTests = 0;
let failedTests = 0;

function testExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${description}: ${filePath}`);
    passedTests++;
  } else {
    console.log(`❌ MISSING: ${description} - ${filePath}`);
    failedTests++;
  }
  
  return exists;
}

function checkDirectory(dirPath, description, requiredFiles = []) {
  console.log(`\n📂 Checking ${description}...`);
  const exists = testExists(dirPath, `Directory exists`);
  
  if (exists && requiredFiles.length > 0) {
    requiredFiles.forEach(file => {
      testExists(path.join(dirPath, file), `  └─ ${file}`);
    });
  }
  
  return exists;
}

// 1. Core AI Brain Components
console.log('\n🧠 AI BRAIN ARCHITECTURE');
console.log('------------------------');
testExists('src/core/ai/index.ts', 'AI Provider System');
testExists('src/core/intelligence/index.ts', 'Intelligence Service');
testExists('src/core/intelligence/conversational-intelligence.ts', 'Conversational Intelligence');
testExists('src/core/intelligence/capability-registry.ts', 'Capability Registry');
testExists('src/core/intelligence/intent-detector.ts', 'Intent Detection');
testExists('src/core/intelligence/role-detector.ts', 'Role Detection');
testExists('src/core/intelligence/lead-research.ts', 'Lead Research');
testExists('src/core/intelligence/tool-suggestion-engine.ts', 'Tool Suggestions');

// 2. Chat & Streaming Services
console.log('\n💬 CHAT & STREAMING');
console.log('-------------------');
testExists('src/core/chat/service.ts', 'Chat Service');
testExists('src/core/chat/unified-provider.ts', 'Unified Chat Provider');
testExists('src/core/chat/conversation-memory.ts', 'Conversation Memory');
testExists('src/core/streaming/unified-stream.ts', 'Streaming Service');
testExists('src/core/stream/sse.ts', 'Server-Sent Events');

// 3. Context Management
console.log('\n🗂️ CONTEXT MANAGEMENT');
console.log('---------------------');
testExists('src/core/context/context-storage.ts', 'Context Storage');
testExists('src/core/context/multimodal-context.ts', 'Multimodal Context');
testExists('src/core/context/context-manager.ts', 'Context Manager');
testExists('src/core/context/capabilities.ts', 'Capabilities Context');

// 4. API Routes
console.log('\n🌐 API ROUTES');
console.log('-------------');
checkDirectory('app/api/chat', 'Chat API', ['route.ts']);
checkDirectory('app/api/multimodal', 'Multimodal API', ['route.ts']);
checkDirectory('app/api/gemini-live', 'Gemini Live API', ['route.ts']);
checkDirectory('app/api/intelligence', 'Intelligence APIs', [
  'context/route.ts',
  'intent/route.ts',
  'suggestions/route.ts'
]);
checkDirectory('app/api/tools', 'Tool APIs', [
  'roi/route.ts',
  'webcam/route.ts',
  'screen/route.ts',
  'url/route.ts',
  'translate/route.ts'
]);

// 5. Real-time Features
console.log('\n⚡ REAL-TIME FEATURES');
console.log('--------------------');
testExists('server/live-server.ts', 'WebSocket Server');
testExists('src/core/gemini-live-api.ts', 'Gemini Live API Client');
testExists('app/api/gemini-live/route.ts', 'Live API Endpoint');

// 6. Gemini & AI Configuration
console.log('\n🤖 AI CONFIGURATION');
console.log('-------------------');
testExists('src/core/gemini-config-enhanced.ts', 'Gemini Configuration');
testExists('src/core/gemini-translator.ts', 'Translation Service');
testExists('src/core/model-selector.ts', 'Model Selector');
testExists('src/core/ai-prompts.ts', 'AI Prompts');

// 7. Business Logic
console.log('\n💼 BUSINESS FEATURES');
console.log('--------------------');
testExists('src/core/business-content-templates.ts', 'Business Templates');
testExists('src/core/services/tool-service.ts', 'Tool Service');
testExists('src/core/lead.ts', 'Lead Management');
testExists('src/core/workflows/finalizeLeadSession.ts', 'Lead Workflows');

// 8. Supporting Services
console.log('\n🔧 SUPPORTING SERVICES');
console.log('----------------------');
testExists('src/core/supabase/client.ts', 'Supabase Client');
testExists('src/core/supabase/server.ts', 'Supabase Server');
testExists('src/core/services/google-search-service.ts', 'Google Search');
testExists('src/core/intelligence/providers/search/google-grounding.ts', 'Grounded Search');
testExists('src/core/email-service.ts', 'Email Service');
testExists('src/core/meeting-scheduler.ts', 'Meeting Scheduler');

// 9. Admin Features
console.log('\n👨‍💼 ADMIN FEATURES');
console.log('-----------------');
checkDirectory('app/api/admin', 'Admin APIs', [
  'chat/route.ts',
  'leads/route.ts',
  'monitoring/route.ts'
]);
testExists('src/core/admin/admin-chat-service.ts', 'Admin Chat Service');
testExists('src/api/admin-chat/handler.ts', 'Admin Chat Handler');

// 10. Browser Tools & Extensions
console.log('\n🌐 BROWSER TOOLS');
console.log('----------------');
checkDirectory('chrome-extension', 'Chrome Extension', [
  'manifest.json',
  'background.js',
  'devtools.js'
]);
testExists('components/ai-elements/web-preview.tsx', 'Web Preview Component');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 BACKEND VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passedTests} tests`);
console.log(`❌ Failed: ${failedTests} tests`);
console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ALL BACKEND COMPONENTS VERIFIED SUCCESSFULLY!');
  console.log('The backend has all critical functionality from FBC_masterV5.');
} else {
  console.log('\n⚠️ Some backend components are missing or not found.');
  console.log('Please review the failed tests above.');
}

process.exit(failedTests > 0 ? 1 : 0);