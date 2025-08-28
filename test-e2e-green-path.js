#!/usr/bin/env node

/**
 * Green Path E2E Test - Complete User Journey
 * Tests the full flow: Consent → Session → Chat → Summary → PDF → Email
 */

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'alex@acme.com';
const TEST_SESSION_ID = 'test-e2e-' + Date.now();

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  // Log removed

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    let data;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('application/pdf') || contentType?.includes('image/')) {
      data = await response.blob();
    } else {
      data = await response.text();
    }

    // Log removed
    if (typeof data === 'string' && data.length > 200) {
      // Log removed}...`);
    } else if (data instanceof Blob) {
      // Log removed`);
    } else {
      // Log removed);
    }

    if (!response.ok) {
      const errorMsg = typeof data === 'object' ? data.error || 'Unknown error' : data;
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    return { response, data };
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    throw error;
  }
}

async function testSSEChat(sessionId, message) {
  // Log removed

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        sessionId: sessionId
      })
    });

    // Log removed

    let receivedData = '';
    if (response.body) {
      const reader = response.body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: ') {
              const data = line.slice(6).trim();
              receivedData += data;
              // Log removed}...`);
            }
          }
        }
      } catch (error) {
        // Log removed
      }
    }

    // Log removed
    return { status: response.status, success: response.ok, data: receivedData };

  } catch (error) {
    // Log removed
    return { status: 0, success: false, data: '' };
  }
}

async function testGreenPathE2E() {
  // Log removed

  try {
    // 1. Consent (Terms & Conditions)
    // Log removed
    try {
      const consentData = await makeRequest('/api/consent', {
        method: 'POST',
        body: {
          email: TEST_EMAIL,
          companyUrl: 'https://acme.com',
          policyVersion: 'v1'
        }
      });
      // Log removed
    } catch (error) {
      // Log removed\n');
    }

    // 2. Session Initialization (Multimodal Context)
    // Log removed
    const sessionData = await makeRequest('/api/intelligence/session-init', {
      method: 'POST',
      body: {
        sessionId: TEST_SESSION_ID,
        email: TEST_EMAIL,
        name: 'Alex',
        companyUrl: 'https://acme.com'
      }
    });

    if (sessionData.data.contextReady) {
      // Log removed
    } else {
      // Log removed
    }

    // 3. Chat Conversation (SSE)
    // Log removed
    const chatResult = await testSSEChat(TEST_SESSION_ID,
      'We want to automate our weekly reporting process and need AI consulting. Can you help us analyze our current setup and provide recommendations?');

    if (chatResult.success) {
      // Log removed
    } else {
      // Log removed
    }

    // 4. Generate Advanced Summary
    // Log removed
    try {
      const summaryData = await makeRequest('/api/summary', {
        method: 'POST',
        body: {
          sessionId: TEST_SESSION_ID
        }
      });

      if (summaryData.data.userSummary && summaryData.data.consultantBrief) {
        // Log removed
        // Log removed
      } else {
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    // 5. Generate PDF Report
    // Log removed
    try {
      const pdfData = await makeRequest('/api/pdf', {
        method: 'POST',
        body: {
          sessionId: TEST_SESSION_ID,
          mode: 'client'
        }
      });

      if (pdfData.data instanceof Blob && pdfData.data.type === 'application/pdf') {
        // Log removed
      } else {
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    // 6. Send Summary Email
    // Log removed
    try {
      const emailData = await makeRequest('/api/email/send-summary', {
        method: 'POST',
        body: {
          sessionId: TEST_SESSION_ID,
          to: TEST_EMAIL
        }
      });

      // Log removed
    } catch (error) {
      // Log removed
    }

    // 7. Test Additional Capabilities
    // Log removed

    // Test Intelligence with Search
    try {
      const searchData = await makeRequest('/api/intelligence-v2', {
        method: 'POST',
        body: {
          query: 'What are the latest AI automation trends for business reporting?',
          type: 'search'
        }
      });
      // Log removed
    } catch (error) {
      // Log removed
    }

    // Test ROI Calculator
    try {
      const roiData = await makeRequest('/api/tools/roi', {
        method: 'POST',
        body: {
          hourlyCost: 75,
          hoursSavedPerWeek: 8,
          teamSize: 12,
          toolCost: 1000
        }
      });
      // Log removed
    } catch (error) {
      // Log removed
    }

    // Test Avatar System
    try {
      const userAvatar = await makeRequest('/api/user-avatar');
      const aiAvatar = await makeRequest('/api/placeholder-avatar');
      if (userAvatar.data.startsWith('<svg') && aiAvatar.data.startsWith('<svg')) {
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    // Log removed
    // Log removed

    // Log removed
    // Log removed
    // Log removed
    // Log removed');
    // Log removed');
    // Log removed');
    // Log removed');
    // Log removed
    // Log removed');
    // Log removed

    // Log removed
    // Log removed

  } catch (error) {
    // Error: 💥 E2E TEST FAILED
    // Error: Full error
    process.exit(1);
  }
}

// Run the green path E2E test
testGreenPathE2E()
  .then(() => {
    // Log removed
    process.exit(0);
  })
  .catch((error) => {
    // Error: \n💥 E2E test failed
    process.exit(1);
  });
