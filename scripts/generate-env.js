#!/usr/bin/env node

/**
 * Generate Complete .env File
 * This script creates a .env file with all required environment variables
 */

const fs = require('fs');
const path = require('path');

// All environment variables from v0-fb-c-ai-clone
const envVars = {
  // Supabase (Critical)
  'SUPABASE_URL': 'your-supabase-url-here',
  'SUPABASE_ANON_KEY': 'your-supabase-anon-key-here',
  'NEXT_PUBLIC_SUPABASE_URL': 'your-supabase-url-here',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your-supabase-anon-key-here',
  'SUPABASE_JWT_SECRET': 'your-supabase-jwt-secret-here',
  'SUPABASE_SERVICE_ROLE_KEY': 'your-supabase-service-role-key-here',
  
  // Database
  'POSTGRES_URL': 'your-postgres-url-here',
  'POSTGRES_PRISMA_URL': 'your-postgres-prisma-url-here',
  'POSTGRES_URL_NON_POOLING': 'your-postgres-non-pooling-url-here',
  'POSTGRES_USER': 'your-postgres-user-here',
  'POSTGRES_PASSWORD': 'your-postgres-password-here',
  'POSTGRES_DATABASE': 'your-postgres-database-here',
  'POSTGRES_HOST': 'your-postgres-host-here',
  
  // AI Services
  'GEMINI_API_KEY': 'your-gemini-api-key-here',
  'GEMINI_API_KEY_SERVER': 'your-gemini-api-key-server-here',
  'NEXT_PUBLIC_GEMINI_API_KEY': 'your-gemini-api-key-here',
  'VITE_GEMINI_API_KEY': 'your-gemini-api-key-here',
  
  // Email Services
  'RESEND_API_KEY': 'your-resend-api-key-here',
  'RESEND_WEBHOOK_SECRET': 'your-resend-webhook-secret-here',
  
  // Security
  'JWT_SECRET': 'your-jwt-secret-here',
  'ADMIN_PASSWORD': 'your-admin-password-here',
  
  // File Storage
  'BLOB_READ_WRITE_TOKEN': 'your-blob-token-here',
  'NEXT_PUBLIC_PDF_LOGO_DATA_URI': 'your-pdf-logo-data-uri-here',
  
  // Live Server
  'NEXT_PUBLIC_LIVE_SERVER_URL': 'your-live-server-url-here',
  
  // App Config
  'BASE_URL': 'your-base-url-here',
  'PORT': 'your-port-here',
  
  // Vite Config
  'VITE_SUPABASE_URL': 'your-supabase-url-here',
  'VITE_SUPABASE_ANON_KEY': 'your-supabase-anon-key-here'
};

// Generate .env content
let envContent = `# Complete Environment Variables for FBC Master V5
# Generated from v0-fb-c-ai-clone project
# ==========================================\n\n`;

Object.entries(envVars).forEach(([key, value]) => {
  envContent += `${key}=${value}\n`;
});

envContent += `\n# ==========================================
# INSTRUCTIONS:
# 1. Replace all "your-*-here" values with actual values
# 2. Copy from v0-fb-c-ai-clone Vercel dashboard
# 3. Upload this file to fbc-master-v5 project
# ==========================================`;

// Write to desktop
const desktopPath = path.join(require('os').homedir(), 'Desktop', 'fbc-master-v5.env');
fs.writeFileSync(desktopPath, envContent);

console.log('✅ .env file created on your Desktop!');
console.log(`📁 Location: ${desktopPath}`);
console.log('\n🚀 Next steps:');
console.log('1. Go to v0-fb-c-ai-clone Vercel dashboard');
console.log('2. Copy all environment variable values');
console.log('3. Replace placeholders in the .env file');
console.log('4. Upload to fbc-master-v5 project');
