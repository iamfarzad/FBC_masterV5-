#!/usr/bin/env node

/**
 * Comprehensive Live Multimodal Pipeline Test
 * Tests the complete AI pipeline with real API calls
 */

const BASE_URL = 'http://localhost:3000';

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

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('image/svg') || contentType?.includes('text/plain')) {
      data = await response.text();
    } else {
      data = await response.text(); // Default to text
    }

    // Log removed
    if (typeof data === 'string' && data.length > 200) {
      // Log removed}...`);
    } else {
      // Log removed);
    }

    if (!response.ok) {
      const errorMsg = typeof data === 'object' ? data.error || 'Unknown error' : data;
      throw new Error(`HTTP ${response.status}: ${errorMsg}`);
    }

    return data;
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

    if (response.body) {
      const reader = response.body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: ') {
              const data = line.slice(6).trim();
              // Log removed}...`);
            }
          }
        }
      } catch (error) {
        // Log removed
      }
    }

    // Log removed
    return { status: response.status, success: response.ok };

  } catch (error) {
    // Log removed
    return { status: 0, success: false };
  }
}

async function testLiveMultimodalPipeline() {
  // Log removed

  try {
    // 1. Test Live API Session Creation
    // Log removed
    const sessionData = await makeRequest('/api/gemini-live', {
      method: 'POST',
      body: {
        action: 'start',
        sessionId: 'test-session-' + Date.now(),
        userContext: {
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company'
        }
      }
    });

    // Log removed

    // 2. Test Multimodal Context Initialization
    // Log removed
    const contextData = await makeRequest('/api/intelligence/session-init', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test User',
        companyUrl: 'https://testcompany.com'
      }
    });

    // Log removed

    // 3. Test Intelligence Pipeline
    // Log removed
    const intelligenceData = await makeRequest('/api/intelligence-v2', {
      method: 'POST',
      body: {
        query: 'Analyze this test company and provide AI consulting recommendations',
        type: 'analysis'
      }
    });

    // Log removed

    // 4. Test Vision Processing (Mock for now - would need actual image)
    // Log removed
    try {
      await makeRequest('/api/tools/webcam', {
        method: 'POST',
        body: {
          action: 'analyze',
          sessionId: 'test-session-' + Date.now(),
          imageData: 'mock-image-base64-data'
        }
      });
      // Log removed
    } catch (error) {
      // Log removed
    }

    // 5. Test Screen Capture Processing
    // Log removed
    try {
      await makeRequest('/api/tools/screen', {
        method: 'POST',
        body: {
          action: 'analyze',
          sessionId: 'test-session-' + Date.now(),
          screenshotData: 'mock-screenshot-base64-data'
        }
      });
      // Log removed
    } catch (error) {
      // Log removed
    }

    // 6. Test Chat Integration (SSE Response)
    // Log removed
    const chatResult = await testSSEChat('test-session-' + Date.now(),
      'Hello, I need AI consulting for my business. Can you help me analyze my current setup?');
    if (chatResult.success) {
      // Log removed\n');
    } else {
      // Log removed
    }

    // 7. Test Avatar Endpoints (SVG Response)
    // Log removed
    try {
      const userAvatarData = await makeRequest('/api/user-avatar');
      if (typeof userAvatarData === 'string' && userAvatarData.startsWith('<svg')) {
        // Log removed\n');
      } else {
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    try {
      const aiAvatarData = await makeRequest('/api/placeholder-avatar');
      if (typeof aiAvatarData === 'string' && aiAvatarData.startsWith('<svg')) {
        // Log removed\n');
      } else {
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    // 8. Test File Upload (Mock)
    // Log removed
    try {
      // Test with proper multipart form data
      const formData = new FormData();
      formData.append('file', new Blob(['test file content'], { type: 'text/plain' }), 'test.txt');

      const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      // Log removed
      if (uploadResponse.ok) {
        // Log removed
      } else {
        const errorData = await uploadResponse.text();
        // Log removed
      }
    } catch (error) {
      // Log removed
    }

    // 9. Test Grounding with Search
    // Log removed
    const searchData = await makeRequest('/api/intelligence-v2', {
      method: 'POST',
      body: {
        query: 'What are the latest trends in AI consulting for businesses?',
        type: 'search'
      }
    });

    // Log removed

    // 10. Test Tool Actions
    // Log removed
    try {
      // Test ROI calculator with proper schema
      const roiData = await makeRequest('/api/tools/roi', {
        method: 'POST',
        body: {
          hourlyCost: 70,
          hoursSavedPerWeek: 5,
          teamSize: 10,
          toolCost: 500
        }
      });

      if (roiData && typeof roiData === 'object') {
        // Log removed
      } else {
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
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed

  } catch (error) {
    // Error: 💥 TEST FAILED
    // Error: Full error
    process.exit(1);
  }
}

// Run the comprehensive test
testLiveMultimodalPipeline()
  .then(() => {
    // Log removed
    process.exit(0);
  })
  .catch((error) => {
    // Error: \n💥 Test suite failed
    process.exit(1);
  });
