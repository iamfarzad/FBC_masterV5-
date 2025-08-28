#!/usr/bin/env node

// Simple test to create context data and test the Intelligence Context API
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_SESSION_ID = 'test-session-critical';

// Helper function to make HTTP requests
function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...options
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testIntelligenceContextAPI() {
  console.log('🧠 Testing Intelligence Context API...\n');

  // Step 1: Try to get context (should be empty initially)
  console.log('Step 1: Getting initial context...');
  const initialResponse = await makeRequest(`${BASE_URL}/api/intelligence/context?sessionId=${TEST_SESSION_ID}`);
  console.log(`Status: ${initialResponse.statusCode}`);
  if (initialResponse.body && Object.keys(initialResponse.body).length > 0) {
    console.log('Initial context:', JSON.stringify(initialResponse.body, null, 2));
  } else {
    console.log('No initial context found (expected)');
  }

  // Step 2: Create session context using session-init
  console.log('\nStep 2: Creating session context...');
  const sessionResponse = await makeRequest(`${BASE_URL}/api/intelligence/session-init`, {
    method: 'POST'
  }, {
    sessionId: TEST_SESSION_ID,
    email: 'test@example.com',
    name: 'Test User'
  });
  console.log(`Session init status: ${sessionResponse.statusCode}`);
  if (sessionResponse.body && Object.keys(sessionResponse.body).length > 0) {
    console.log('Session init response:', JSON.stringify(sessionResponse.body, null, 2));
  }

  // Step 3: Wait a moment for processing
  console.log('\nStep 3: Waiting for context processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: Try to get context again
  console.log('\nStep 4: Getting context after session init...');
  const finalResponse = await makeRequest(`${BASE_URL}/api/intelligence/context?sessionId=${TEST_SESSION_ID}`);
  console.log(`Final status: ${finalResponse.statusCode}`);
  if (finalResponse.body && Object.keys(finalResponse.body).length > 0) {
    console.log('Final context:', JSON.stringify(finalResponse.body, null, 2));
  } else {
    console.log('Still no context found');

    // Step 5: Try fallback mechanism - create context directly
    console.log('\nStep 5: Testing fallback mechanism...');
    console.log('Creating context data directly via a simple API endpoint...');

    // Let's create a simple test endpoint to manually create context
    const manualContextResponse = await makeRequest(`${BASE_URL}/api/intelligence/context`, {
      method: 'POST'
    }, {
      sessionId: TEST_SESSION_ID,
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company'
    });

    console.log(`Manual context creation status: ${manualContextResponse.statusCode}`);
    if (manualContextResponse.body) {
      console.log('Manual context response:', JSON.stringify(manualContextResponse.body, null, 2));
    }

    // Step 6: Final check
    console.log('\nStep 6: Final context check...');
    const finalCheckResponse = await makeRequest(`${BASE_URL}/api/intelligence/context?sessionId=${TEST_SESSION_ID}`);
    console.log(`Final check status: ${finalCheckResponse.statusCode}`);
    if (finalCheckResponse.body && Object.keys(finalCheckResponse.body).length > 0) {
      console.log('✅ SUCCESS! Context found:', JSON.stringify(finalCheckResponse.body, null, 2));
    } else {
      console.log('❌ FAILURE: No context found even after manual creation');
    }
  }

  console.log('\n🎯 Intelligence Context API Test Complete');
}

// Run the test
testIntelligenceContextAPI().catch(console.error);
