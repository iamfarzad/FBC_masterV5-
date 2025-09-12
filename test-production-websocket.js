#!/usr/bin/env node

// Test WebSocket connection to production Fly.io server
const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection to production...');
console.log('🌐 URL: wss://fb-consulting-websocket.fly.dev');

const ws = new WebSocket('wss://fb-consulting-websocket.fly.dev', {
  headers: {
    'User-Agent': 'F.B/c-Test-Client/1.0',
    'Origin': 'https://www.farzadbayat.com'
  }
});

let connected = false;
let startTime = Date.now();

ws.on('open', () => {
  connected = true;
  const connectTime = Date.now() - startTime;
  console.log(`✅ WebSocket connected successfully in ${connectTime}ms`);
  
  // Send test message
  const testMessage = {
    type: 'start',
    payload: {
      languageCode: 'en-US',
      voiceName: 'Puck'
    }
  };
  
  console.log('📤 Sending test message...');
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message:', JSON.stringify(message, null, 2));
    
    if (message.type === 'connected') {
      console.log(`🆔 Connection ID: ${message.payload?.connectionId}`);
    }
  } catch (e) {
    console.log('📨 Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.error('📋 Error details:', error);
});

ws.on('close', (code, reason) => {
  const closeTime = Date.now() - startTime;
  console.log(`🔌 WebSocket closed after ${closeTime}ms`);
  console.log(`📊 Close code: ${code}`);
  console.log(`📝 Close reason: ${reason?.toString() || 'No reason provided'}`);
  
  if (!connected) {
    console.error('❌ Connection closed before establishing connection!');
    console.error('🔍 This indicates a server-side issue or configuration problem');
  }
  
  process.exit(connected ? 0 : 1);
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!connected) {
    console.error('⏰ Connection timeout after 10 seconds');
    ws.close();
  } else {
    console.log('✅ Test completed successfully');
    ws.close();
  }
}, 10000);

console.log('⏳ Attempting connection...');