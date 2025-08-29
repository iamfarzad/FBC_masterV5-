#!/usr/bin/env node

console.log('🔍 Environment Debug Script');
console.log('==========================\n');

// Check if we're in Node.js environment
console.log('📍 Environment Info:');
console.log('- Node.js version:', process.version);
console.log('- Platform:', process.platform);
console.log('- Architecture:', process.arch);

// Check for key environment variables
console.log('\n🔑 Environment Variables:');
const envVars = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'NODE_ENV',
  'NEXT_PUBLIC_NODE_ENV'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Test localStorage simulation
console.log('\n💾 localStorage Simulation:');
console.log('- typeof window:', typeof window);
console.log('- typeof localStorage:', typeof localStorage);
console.log('- typeof global:', typeof global);
console.log('- typeof globalThis:', typeof globalThis);

// Test if we can access localStorage safely
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('✅ Browser environment: localStorage available');
    window.localStorage.setItem('test', 'working');
    const testValue = window.localStorage.getItem('test');
    console.log('✅ localStorage test:', testValue);
    window.localStorage.removeItem('test');
  } else {
    console.log('ℹ️ Server environment: localStorage not available');
  }
} catch (error) {
  console.log('❌ localStorage error:', error.message);
}

// Check Next.js specific globals
console.log('\n🌐 Next.js Environment:');
console.log('- process.browser:', process.browser);
console.log('- process.server:', !process.browser);

console.log('\n✅ Debug complete!');
