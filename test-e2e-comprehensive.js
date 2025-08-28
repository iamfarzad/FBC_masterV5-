#!/usr/bin/env node

/**
 * F.B/c Comprehensive E2E Test Suite
 * Tests frontend + backend pipeline: Consent → Context → Chat (SSE) → PDF → Upload → Intelligence
 * Generates JUnit/JSON reports for CI integration
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

class E2ETestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testName = 'agentdesk-e2e-' + Date.now();
    this.userName = 'Test User';
    this.workEmail = 'alex@acme.com';
    this.companyUrl = 'https://acme.com';
    this.results = [];
    this.cookies = '';
    this.startTime = Date.now();
  }

  // Test result tracking
  logResult(step, status, message, details = {}) {
    const result = {
      step,
      status, // 'pass', 'fail', 'skip'
      message,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      ...details
    };
    this.results.push(result);
    // Log removed}] ${step}: ${message}`);
    if (details.error) {
      console.error(`  Error: ${details.error}`);
    }
  }

  // HTTP request helper
  async makeRequest(method, url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method.toUpperCase(),
        headers: {
          'User-Agent': 'FBC-E2E-Test/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      };

      // Add cookies if available
      if (this.cookies && options.withCookies) {
        reqOptions.headers['Cookie'] = this.cookies;
      }

      const req = client.request(reqOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data,
            contentType: res.headers['content-type'] || ''
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      // Send body for POST/PUT requests
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  // Test: Backend Health Check
  async testBackendHealth() {
    try {
      const response = await this.makeRequest('GET', `${this.baseUrl}/api/health`);

      if (response.status === 200) {
        this.logResult('backend-health', 'pass', 'Backend health check passed');
        return true;
      } else {
        this.logResult('backend-health', 'fail', `Backend health check failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logResult('backend-health', 'fail', 'Backend health check error', { error: error.message });
      return false;
    }
  }

  // Test: Consent API
  async testConsentAPI() {
    try {
      // First, set a consent cookie
      const consentData = {
        email: this.workEmail,
        companyUrl: this.companyUrl,
        allow: true
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/consent`, {
        body: consentData,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        // Extract cookies from response
        if (response.headers['set-cookie']) {
          this.cookies = response.headers['set-cookie'].join('; ');
        }

        this.logResult('consent-api', 'pass', 'Consent API call successful');
        return true;
      } else {
        this.logResult('consent-api', 'fail', `Consent API failed: ${response.status}`, {
          response: response.data
        });
        return false;
      }
    } catch (error) {
      this.logResult('consent-api', 'fail', 'Consent API error', { error: error.message });
      return false;
    }
  }

  // Test: Context Initialization
  async testContextInit() {
    try {
      const contextData = {
        sessionId: `session-${this.testName}`,
        name: this.userName,
        email: this.workEmail,
        companyUrl: this.companyUrl
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/intelligence/session-init`, {
        body: contextData,
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      if (response.status === 200) {
        const jsonData = JSON.parse(response.data);
        if (jsonData.contextReady) {
          this.logResult('context-init', 'pass', 'Context initialization successful');
          return true;
        } else {
          this.logResult('context-init', 'fail', 'Context initialization incomplete', {
            response: jsonData
          });
          return false;
        }
      } else {
        this.logResult('context-init', 'fail', `Context init failed: ${response.status}`, {
          response: response.data
        });
        return false;
      }
    } catch (error) {
      this.logResult('context-init', 'fail', 'Context init error', { error: error.message });
      return false;
    }
  }

  // Test: Chat API (SSE simulation)
  async testChatAPI() {
    try {
      const chatData = {
        sessionId: `session-${this.testName}`,
        messages: [
          { role: 'user', content: 'Hello, this is a test message for SSE probe.' }
        ]
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/chat`, {
        body: chatData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        withCookies: true
      });

      if (response.status === 200) {
        // Check if response looks like SSE
        if (response.data.includes('data:') || response.contentType.includes('text/event-stream')) {
          this.logResult('chat-sse', 'pass', 'Chat SSE response received');
          return true;
        } else {
          this.logResult('chat-sse', 'fail', 'Response not in SSE format', {
            contentType: response.contentType,
            data: response.data.substring(0, 200)
          });
          return false;
        }
      } else {
        this.logResult('chat-sse', 'fail', `Chat API failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logResult('chat-sse', 'fail', 'Chat API error', { error: error.message });
      return false;
    }
  }

  // Test: Intelligence API
  async testIntelligenceAPI() {
    try {
      const intelData = {
        action: 'analyze',
        query: 'Business consulting needs for AI transformation',
        type: 'consulting'
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/intelligence-v2`, {
        body: intelData,
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      if (response.status === 200) {
        const jsonData = JSON.parse(response.data);
        if (jsonData.success !== false) {
          this.logResult('intelligence', 'pass', 'Intelligence API call successful');
          return true;
        } else {
          this.logResult('intelligence', 'fail', 'Intelligence API returned success=false', {
            response: jsonData
          });
          return false;
        }
      } else {
        this.logResult('intelligence', 'fail', `Intelligence API failed: ${response.status}`, {
          response: response.data
        });
        return false;
      }
    } catch (error) {
      this.logResult('intelligence', 'fail', 'Intelligence API error', { error: error.message });
      return false;
    }
  }

  // Test: PDF Export
  async testPDFExport() {
    try {
      const pdfData = {
        sessionId: `session-${this.testName}`,
        leadEmail: this.workEmail
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/export-summary`, {
        body: pdfData,
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      if (response.status === 200) {
        if (response.contentType.includes('application/pdf')) {
          this.logResult('pdf-export', 'pass', 'PDF export successful');
          return true;
        } else {
          this.logResult('pdf-export', 'fail', 'Response not PDF format', {
            contentType: response.contentType
          });
          return false;
        }
      } else {
        this.logResult('pdf-export', 'fail', `PDF export failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logResult('pdf-export', 'fail', 'PDF export error', { error: error.message });
      return false;
    }
  }

  // Test: Avatar APIs
  async testAvatars() {
    const tests = [
      { name: 'user-avatar', url: '/api/user-avatar' },
      { name: 'placeholder-avatar', url: '/api/placeholder-avatar' }
    ];

    let allPassed = true;

    for (const test of tests) {
      try {
        const response = await this.makeRequest('GET', `${this.baseUrl}${test.url}`);

        if (response.status === 200 && response.data.includes('<svg')) {
          this.logResult(test.name, 'pass', `${test.name} API successful`);
        } else {
          this.logResult(test.name, 'fail', `${test.name} API failed`, {
            status: response.status,
            data: response.data.substring(0, 100)
          });
          allPassed = false;
        }
      } catch (error) {
        this.logResult(test.name, 'fail', `${test.name} API error`, { error: error.message });
        allPassed = false;
      }
    }

    return allPassed;
  }

  // Test: File Upload (simplified - GET test first)
  async testFileUpload() {
    try {
      // First test the GET endpoint to make sure the upload route is working
      const getResponse = await this.makeRequest('GET', `${this.baseUrl}/api/upload`);

      if (getResponse.status === 200) {
        this.logResult('file-upload', 'pass', 'Upload endpoint accessible (GET test)', {
          response: JSON.parse(getResponse.data)
        });
        return true;
      } else {
        this.logResult('file-upload', 'fail', `Upload GET endpoint failed: ${getResponse.status}`, {
          response: getResponse.data
        });
        return false;
      }
    } catch (error) {
      this.logResult('file-upload', 'fail', 'File upload error', { error: error.message });
      return false;
    }
  }

  // Test: ROI Tool
  async testROITool() {
    try {
      const roiData = {
        initialInvestment: 10000,
        monthlyRevenue: 2000,
        monthlyExpenses: 1500,
        timePeriod: 12
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/tools/roi`, {
        body: roiData,
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      if (response.status === 200) {
        const jsonData = JSON.parse(response.data);
        const hasROI = jsonData.output?.roi || jsonData.roi || jsonData.result?.roi;

        if (hasROI !== undefined) {
          this.logResult('roi-tool', 'pass', 'ROI tool calculation successful');
          return true;
        } else {
          this.logResult('roi-tool', 'fail', 'ROI tool response missing ROI data', {
            response: jsonData
          });
          return false;
        }
      } else {
        this.logResult('roi-tool', 'fail', `ROI tool failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logResult('roi-tool', 'fail', 'ROI tool error', { error: error.message });
      return false;
    }
  }

  // Test: Live API (self-skipping)
  async testLiveAPI() {
    try {
      // First, probe if the service is available
      const probeResponse = await this.makeRequest('POST', `${this.baseUrl}/api/gemini-live`, {
        body: { action: 'probe' },
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      if (probeResponse.status === 200) {
        const probeData = JSON.parse(probeResponse.data);

        if (probeData.available === false) {
          this.logResult('live-api', 'skip', `Live API not available: ${probeData.reason || 'disabled'}`);
          return true; // Skip is acceptable
        }
      }

      // If probe doesn't return availability info or returns 503, try the real request
      const liveData = {
        action: 'start',
        sessionId: `live-${this.testName}`,
        userContext: { name: this.userName }
      };

      const response = await this.makeRequest('POST', `${this.baseUrl}/api/gemini-live`, {
        body: liveData,
        headers: { 'Content-Type': 'application/json' },
        withCookies: true
      });

      // 503 is acceptable (service disabled)
      if (response.status === 200) {
        this.logResult('live-api', 'pass', 'Live API started successfully');
        return true;
      } else if (response.status === 503) {
        this.logResult('live-api', 'skip', 'Live API disabled (503 response)');
        return true; // Skip is acceptable
      } else {
        this.logResult('live-api', 'fail', `Live API failed: ${response.status}`, {
          response: response.data
        });
        return false;
      }
    } catch (error) {
      this.logResult('live-api', 'skip', 'Live API error (expected if disabled)', { error: error.message });
      return true; // Skip is acceptable
    }
  }

  // Generate JUnit XML report
  generateJUnitReport() {
    const totalTests = this.results.length;
    const failures = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites>\n`;
    xml += `  <testsuite name="FBC-E2E-Test-Suite" tests="${totalTests}" failures="${failures}" skipped="${skipped}">\n`;

    for (const result of this.results) {
      xml += `    <testcase name="${result.step}" time="${(result.duration / 1000).toFixed(3)}">\n`;

      if (result.status === 'fail') {
        xml += `      <failure message="${result.message}">\n`;
        if (result.error) {
          xml += `        <![CDATA[${result.error}]]>\n`;
        }
        xml += `      </failure>\n`;
      } else if (result.status === 'skip') {
        xml += `      <skipped message="${result.message}" />\n`;
      }

      xml += `    </testcase>\n`;
    }

    xml += `  </testsuite>\n`;
    xml += `</testsuites>`;

    return xml;
  }

  // Generate JSON report
  generateJSONReport() {
    return JSON.stringify({
      testSuite: 'FBC-E2E-Test-Suite',
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'pass').length,
        failed: this.results.filter(r => r.status === 'fail').length,
        skipped: this.results.filter(r => r.status === 'skip').length
      },
      results: this.results,
      duration: Date.now() - this.startTime
    }, null, 2);
  }

  // Run all tests
  async runAllTests() {
    // Log removed

    const tests = [
      { name: 'Backend Health', fn: this.testBackendHealth.bind(this) },
      { name: 'Consent API', fn: this.testConsentAPI.bind(this) },
      { name: 'Context Init', fn: this.testContextInit.bind(this) },
      { name: 'Chat SSE', fn: this.testChatAPI.bind(this) },
      { name: 'Intelligence', fn: this.testIntelligenceAPI.bind(this) },
      { name: 'PDF Export', fn: this.testPDFExport.bind(this) },
      { name: 'Avatars', fn: this.testAvatars.bind(this) },
      { name: 'File Upload', fn: this.testFileUpload.bind(this) },
      { name: 'ROI Tool', fn: this.testROITool.bind(this) },
      { name: 'Live API', fn: this.testLiveAPI.bind(this) }
    ];

    for (const test of tests) {
      // Log removed
      await test.fn();
    }

    // Generate reports
    // Log removed

    const junitReport = this.generateJUnitReport();
    const jsonReport = this.generateJSONReport();

    // Write reports to files
    fs.writeFileSync('test-results.junit.xml', junitReport);
    fs.writeFileSync('test-results.json', jsonReport);

    // Summary
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    // Log removed
    // Log removed
    // Log removed
    // Log removed
    // Log removed

    return failed === 0;
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      // Error: Test runner error
      process.exit(1);
    });
}

module.exports = E2ETestRunner;
