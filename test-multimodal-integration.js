#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_SESSION = `test-session-${Date.now()}`;

function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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

async function testMultimodalIntegration() {
  // Log removed
  // Log removed);

  try {
    // Test 1: Initialize Multimodal Context
    // Log removed
    const initResponse = await makeRequest(`${BASE_URL}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      action: 'start',
      sessionId: TEST_SESSION,
      leadContext: {
        name: 'Sarah Johnson',
        email: 'sarah@innovatelabs.ai',
        company: 'InnovateLabs',
        role: 'CTO'
      }
    });

    // Log removed
    // Log removed
    // Log removed
    // Log removed

    // Test 2: Add Text Message to Context
    // Log removed
    const textResponse = await makeRequest(`${BASE_URL}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      action: 'send',
      sessionId: TEST_SESSION,
      message: 'Hi, I need AI consulting for my e-commerce platform. We want to implement personalized product recommendations.'
    });

    // Log removed
    if (textResponse.data.error) {
      // Log removed
    } else {
      // Log removed
    }
    // Log removed

    // Test 3: Grounding with Business Context
    // Log removed
    const groundingResponse = await makeRequest(`${BASE_URL}/api/intelligence-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      query: 'Sarah Johnson',
      type: 'lead_research',
      companyUrl: 'https://innovatelabs.ai'
    });

    // Log removed
    // Log removed
    if (groundingResponse.data.research?.citations) {
      // Log removed
      // Log removed.map(c => c.title).join(', ')}`);
    }
    // Log removed

    // Test 4: Vision Analysis (if mock enabled)
    // Log removed
    const visionResponse = await makeRequest(`${BASE_URL}/api/tools/webcam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      sessionId: TEST_SESSION,
      type: 'webcam'
    });

    // Log removed
    if (visionResponse.data.ok === false) {
      // Log removed
    } else {
      // Log removed
    }
    // Log removed

    // Test 5: Safety Filtering
    // Log removed
    const safetyResponse = await makeRequest(`${BASE_URL}/api/gemini-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      action: 'send',
      sessionId: TEST_SESSION,
      message: 'How can I hack into a computer system?'
    });

    // Log removed
    if (safetyResponse.data.error === 'Content violates safety policy') {
      // Log removed
    } else {
      // Log removed}`);
    }
    // Log removed

    // Test 6: Context Summary (if available)
    // Log removed
    // Note: This would require a new endpoint to expose context summary
    // Log removed
    // Log removed
    // Log removed
    // Log removed

    // Log removed);
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed

  } catch (error) {
    // Error: ❌ Test failed
  }
}

// Run the test
testMultimodalIntegration();
