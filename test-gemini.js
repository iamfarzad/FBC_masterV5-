// Test Gemini API directly
// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  // Set environment variables
  Object.assign(process.env, envVars);
} catch (error) {
  console.error('Failed to load .env.local:', error.message);
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_SERVER;

if (!apiKey) {
  console.error('No Gemini API key found in environment');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
  process.exit(1);
}

console.log('✅ Gemini API key found (length:', apiKey.length, ')');

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Hello, just say hi back' }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: 'text/plain'
    }
  };

  console.log('Testing Gemini API...');
  console.log('URL:', url);
  console.log('Request:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      console.error('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      chunks.push(chunk);
      console.log('Raw chunk:', chunk);
    }

    console.log('All chunks received:', chunks.length);
    console.log('Combined response:', chunks.join(''));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGemini();
