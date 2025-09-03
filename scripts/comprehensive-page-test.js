#!/usr/bin/env node

/**
 * Comprehensive Page and Component Testing
 * Tests navigation, design, theme mode, and functionality
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5000';
const testResults = {
  pages: [],
  apis: [],
  components: [],
  features: []
};

async function testPage(path, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(BASE_URL + path, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        const success = res.statusCode === 200;
        
        testResults.pages.push({
          path,
          description,
          status: res.statusCode,
          success,
          loadTime,
          hasContent: data.length > 1000
        });
        
        console.log(`${success ? '✅' : '❌'} ${path} - ${description} (${res.statusCode}, ${loadTime}ms)`);
        resolve(success);
      });
    }).on('error', (err) => {
      testResults.pages.push({
        path,
        description,
        error: err.message,
        success: false
      });
      console.log(`❌ ${path} - Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function testAPI(path, method = 'GET', body = null, description = '') {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };

    const req = http.request(BASE_URL + path, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        testResults.apis.push({
          path,
          method,
          description,
          status: res.statusCode,
          success,
          hasResponse: data.length > 0
        });
        
        console.log(`${success ? '✅' : '❌'} [${method}] ${path} ${description ? '- ' + description : ''} (${res.statusCode})`);
        
        // Try to parse response for detailed info
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            console.log(`   ⚠️ Error: ${parsed.error}`);
          }
        } catch {}
        
        resolve(success);
      });
    });

    req.on('error', (err) => {
      testResults.apis.push({
        path,
        method,
        description,
        error: err.message,
        success: false
      });
      console.log(`❌ [${method}] ${path} - Error: ${err.message}`);
      resolve(false);
    });

    if (body && method !== 'GET') {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE PLATFORM TESTING\n');
  console.log('=' .repeat(50));
  
  // ========== TEST PAGES ==========
  console.log('\n📄 TESTING ALL PAGES\n');
  
  await testPage('/', 'Homepage with landing content');
  await testPage('/chat', 'Main chat interface');
  await testPage('/workshop', 'Workshop learning modules');
  await testPage('/admin', 'Admin dashboard');
  await testPage('/admin/dashboard', 'Admin dashboard main');
  await testPage('/admin/chat', 'Admin chat interface');
  await testPage('/playground', 'Code playground');
  await testPage('/apps', 'App marketplace');
  await testPage('/research', 'Research interface');
  
  // ========== TEST CHAT APIS ==========
  console.log('\n💬 TESTING CHAT APIs\n');
  
  await testAPI('/api/chat', 'POST', {
    messages: [{ role: 'user', content: 'Hello AI' }],
    stream: false
  }, 'Basic chat');
  
  await testAPI('/api/admin/chat', 'POST', {
    messages: [{ role: 'user', content: 'Admin test message' }],
    context: { isAdmin: true }
  }, 'Admin chat');
  
  await testAPI('/api/multimodal', 'POST', {
    modality: 'text',
    content: 'Test multimodal',
    sessionId: 'test-session-123'
  }, 'Multimodal text');
  
  // ========== TEST INTELLIGENCE APIs ==========
  console.log('\n🧠 TESTING INTELLIGENCE APIs\n');
  
  await testAPI('/api/intelligence/context?sessionId=test123', 'GET', null, 'Get context');
  
  await testAPI('/api/intelligence/intent', 'POST', {
    message: 'I need help calculating ROI for my business',
    sessionId: 'test123',
    context: {}
  }, 'Intent detection');
  
  await testAPI('/api/intelligence/suggestions', 'POST', {
    context: {
      intent: { type: 'business', subtype: 'roi_calculation' }
    },
    sessionId: 'test123'
  }, 'Smart suggestions');
  
  await testAPI('/api/intelligence/analyze-image', 'POST', {
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    sessionId: 'test123'
  }, 'Image analysis');
  
  // ========== TEST TOOL APIs ==========
  console.log('\n🔧 TESTING TOOL APIs\n');
  
  await testAPI('/api/tools/roi', 'POST', {
    initialInvestment: 10000,
    monthlyRevenue: 5000,
    monthlyExpenses: 2000,
    timePeriod: 12
  }, 'ROI Calculator');
  
  await testAPI('/api/tools/translate', 'POST', {
    text: 'Hello world',
    targetLang: 'es',
    sessionId: 'test123'
  }, 'Translation');
  
  await testAPI('/api/tools/webcam', 'POST', {
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    sessionId: 'test123'
  }, 'Webcam capture');
  
  await testAPI('/api/tools/screen', 'POST', {
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    sessionId: 'test123'
  }, 'Screen capture');
  
  await testAPI('/api/tools/url', 'POST', {
    url: 'https://example.com',
    sessionId: 'test123'
  }, 'URL analysis');
  
  await testAPI('/api/tools/doc', 'POST', {
    content: 'Sample document text for analysis',
    fileType: 'text',
    sessionId: 'test123'
  }, 'Document processing');
  
  // ========== TEST ADMIN APIs ==========
  console.log('\n👨‍💼 TESTING ADMIN APIs\n');
  
  await testAPI('/api/admin/leads', 'GET', null, 'Get leads');
  
  await testAPI('/api/admin/leads', 'POST', {
    name: 'Test Lead',
    email: 'test@example.com',
    company: 'Test Corp'
  }, 'Create lead');
  
  await testAPI('/api/admin/monitoring', 'GET', null, 'System monitoring');
  
  await testAPI('/api/admin/email-campaigns', 'POST', {
    campaign: {
      subject: 'Test Campaign',
      body: 'Test email content',
      recipients: ['test@example.com']
    }
  }, 'Email campaign');
  
  // ========== TEST REAL-TIME APIs ==========
  console.log('\n🔴 TESTING REAL-TIME APIs\n');
  
  await testAPI('/api/gemini-live', 'POST', {
    action: 'probe',
    sessionId: 'test123'
  }, 'Gemini Live probe');
  
  await testAPI('/api/webhook', 'POST', {
    event: 'test_event',
    data: { test: true }
  }, 'Webhook endpoint');
  
  // ========== TEST UTILITY APIs ==========
  console.log('\n⚙️ TESTING UTILITY APIs\n');
  
  await testAPI('/api/health', 'GET', null, 'Health check');
  await testAPI('/api/consent', 'GET', null, 'Get consent status');
  await testAPI('/api/consent', 'POST', {
    consented: true,
    timestamp: new Date().toISOString()
  }, 'Update consent');
  
  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const pageSuccess = testResults.pages.filter(p => p.success).length;
  const apiSuccess = testResults.apis.filter(a => a.success).length;
  
  console.log(`\n📄 Pages: ${pageSuccess}/${testResults.pages.length} passed`);
  console.log(`🌐 APIs: ${apiSuccess}/${testResults.apis.length} passed`);
  
  // Show failed tests
  const failedPages = testResults.pages.filter(p => !p.success);
  const failedAPIs = testResults.apis.filter(a => !a.success);
  
  if (failedPages.length > 0) {
    console.log('\n❌ Failed Pages:');
    failedPages.forEach(p => {
      console.log(`  - ${p.path}: ${p.error || 'Status ' + p.status}`);
    });
  }
  
  if (failedAPIs.length > 0) {
    console.log('\n❌ Failed APIs:');
    failedAPIs.forEach(a => {
      console.log(`  - [${a.method}] ${a.path}: ${a.error || 'Status ' + a.status}`);
    });
  }
  
  // Performance metrics
  const avgPageLoad = testResults.pages
    .filter(p => p.loadTime)
    .reduce((sum, p) => sum + p.loadTime, 0) / testResults.pages.filter(p => p.loadTime).length;
  
  console.log(`\n⚡ Average page load time: ${Math.round(avgPageLoad)}ms`);
  
  const totalSuccess = pageSuccess + apiSuccess;
  const totalTests = testResults.pages.length + testResults.apis.length;
  const successRate = (totalSuccess / totalTests * 100).toFixed(1);
  
  console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
  
  if (successRate === '100.0') {
    console.log('🎉 ALL TESTS PASSED!');
  } else if (successRate >= 80) {
    console.log('✅ Platform is mostly functional');
  } else {
    console.log('⚠️ Several issues need attention');
  }
}

// Run all tests
console.log('⏳ Waiting for server to be ready...\n');
setTimeout(runTests, 3000);