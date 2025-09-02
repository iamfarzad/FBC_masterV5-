#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run this after transferring environment variables to verify they're set
 */

const requiredVars = [
  // Supabase (Critical)
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  
  // AI Services
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  
  // Email Services
  'RESEND_API_KEY',
  
  // Database
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  
  // Security
  'JWT_SECRET'
];

console.log('🔍 Verifying Environment Variables...\n');

let missingVars = [];
let presentVars = [];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName);
    console.log(`✅ ${varName}: Set`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing`);
  }
});

console.log('\n📊 Summary:');
console.log(`✅ Present: ${presentVars.length}/${requiredVars.length}`);
console.log(`❌ Missing: ${missingVars.length}/${requiredVars.length}`);

if (missingVars.length > 0) {
  console.log('\n🚨 Missing Variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Transfer the missing variables from v0-fb-c-ai-clone project');
  process.exit(1);
} else {
  console.log('\n🎉 All required environment variables are set!');
  console.log('🚀 Ready to deploy to Vercel');
}
