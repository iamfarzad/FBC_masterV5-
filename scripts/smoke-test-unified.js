#!/usr/bin/env node

/**
 * 🚀 UNIFIED CHAT SMOKE TESTS
 * Tests critical functionality of the unified chat system
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testUnifiedChat() {
  console.log('🚀 Starting unified chat smoke tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  async function runTest(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      const result = await testFn();
      if (result) {
        console.log(`✅ PASSED: ${name}\n`);
        results.passed++;
        results.tests.push({ name, status: 'PASSED' });
      } else {
        console.log(`❌ FAILED: ${name}\n`);
        results.failed++;
        results.tests.push({ name, status: 'FAILED' });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${name} - ${error.message}\n`);
      results.failed++;
      results.tests.push({ name, status: 'ERROR', error: error.message });
    }
  }

  // Test 1: Identity check - AI should mention F.B/c
  await runTest('AI Identity Check', async () => {
    const response = await fetch(`${BASE_URL}/api/chat/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Who are you?',
          timestamp: new Date(),
          type: 'text'
        }],
        mode: 'standard',
        stream: false // Request non-streaming response
      })
    });

    if (!response.ok) return false;

    const data = await response.json();
    const responseText = data.messages?.[0]?.content || '';

    return responseText.toLowerCase().includes('f.b/c') ||
           responseText.toLowerCase().includes('fbc') ||
           responseText.includes('F.B/c');
  });

  // Test 2: Session initialization with context
  await runTest('Session Context Initialization', async () => {
    const sessionId = `smoke-test-${Date.now()}`;

    const response = await fetch(`${BASE_URL}/api/chat/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Initialize session for John from ABC Corp',
          timestamp: new Date(),
          type: 'text'
        }],
        context: {
          sessionId,
          leadContext: {
            name: 'John Doe',
            email: 'john@abc.com',
            company: 'ABC Corp',
            role: 'CEO'
          }
        },
        mode: 'standard',
        stream: false // Request non-streaming response
      })
    });

    if (!response.ok) return false;

    const data = await response.json();
    const responseText = data.messages?.[0]?.content || '';

    // Should acknowledge the context
    return responseText.toLowerCase().includes('john') ||
           responseText.toLowerCase().includes('abc') ||
           responseText.includes('session');
  });

  // Test 3: Tool suggestion capability
  await runTest('Tool Capabilities', async () => {
    const response = await fetch(`${BASE_URL}/api/chat/unified?action=capabilities`);

    if (!response.ok) return false;

    const data = await response.json();

    // Should have supported modes and capabilities
    return data.capabilities &&
           data.capabilities.supportedModes &&
           data.capabilities.supportedModes.length > 0;
  });

  // Test 4: Real-time mode availability
  await runTest('Real-time Mode Support', async () => {
    const response = await fetch(`${BASE_URL}/api/chat/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Test real-time mode',
          timestamp: new Date(),
          type: 'text'
        }],
        mode: 'realtime'
      })
    });

    // Should not fail with mode error
    return response.status !== 400 ||
           !response.statusText.includes('Unsupported chat mode');
  });

  // Test 5: Legacy API deprecation warnings
  await runTest('Legacy API Deprecation', async () => {
    const response = await fetch(`${BASE_URL}/api/ai-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Hello from deprecated endpoint'
      })
    });

    const deprecationHeader = response.headers.get('x-deprecated');
    const deprecationNote = response.headers.get('x-deprecation-note');

    return deprecationHeader === 'true' &&
           deprecationNote &&
           deprecationNote.includes('/api/chat/unified');
  });

  // Test 6: Multimodal support check
  await runTest('Multimodal Support', async () => {
    const response = await fetch(`${BASE_URL}/api/chat/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Test multimodal capabilities',
          timestamp: new Date(),
          type: 'text'
        }],
        context: {
          multimodalData: {
            audioData: 'test-audio-data',
            mimeType: 'audio/pcm'
          }
        },
        mode: 'multimodal'
      })
    });

    // Should handle multimodal input gracefully
    return response.status !== 500;
  });

  // Test 7: Admin mode functionality
  await runTest('Admin Mode Support', async () => {
    const response = await fetch(`${BASE_URL}/api/chat/unified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          id: crypto.randomUUID(),
          role: 'user',
          content: 'Admin test - lead management',
          timestamp: new Date(),
          type: 'text'
        }],
        context: {
          adminId: 'test-admin'
        },
        mode: 'admin'
      })
    });

    // Should handle admin mode gracefully
    return response.status !== 400 ||
           !response.statusText.includes('Unsupported chat mode');
  });

  // Print results
  console.log('📊 SMOKE TEST RESULTS');
  console.log('==================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Total:  ${results.passed + results.failed}`);

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(test => test.status !== 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.status}${test.error ? ` (${test.error})` : ''}`);
      });
  }

  // Exit with appropriate code
  if (results.failed > 0) {
    console.log(`\n❌ ${results.failed} tests failed - unified system needs attention`);
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed - unified system is healthy!');
    process.exit(0);
  }
}

// Run tests
testUnifiedChat().catch(error => {
  console.error('💥 Smoke test runner failed:', error);
  process.exit(1);
});
