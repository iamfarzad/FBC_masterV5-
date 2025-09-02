#!/usr/bin/env node

/**
 * Bulk Upload Environment Variables to Vercel
 * This script helps you upload all environment variables at once
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Bulk Upload Environment Variables to Vercel');
console.log('==============================================\n');

console.log('📋 STEP 1: Prepare Your .env File');
console.log('1. Open the file on your Desktop: fbc-master-v5.env');
console.log('2. Replace all "your-*-here" values with actual values from v0-fb-c-ai-clone');
console.log('3. Save the file\n');

console.log('📋 STEP 2: Upload to Vercel (Choose Method)');
console.log('\n🔹 METHOD A: Vercel Dashboard (Recommended)');
console.log('1. Go to: https://vercel.com/iamfarzads-projects/fbc-master-v5');
console.log('2. Settings → Environment Variables');
console.log('3. Click "Add New" for each variable');
console.log('4. Copy-paste from your .env file\n');

console.log('🔹 METHOD B: Vercel CLI (Advanced)');
console.log('1. Make sure you\'re linked to fbc-master-v5: vercel link --project fbc-master-v5');
console.log('2. For each variable in your .env file, run:');
console.log('   vercel env add VARIABLE_NAME');
console.log('3. Paste the value when prompted\n');

console.log('🔹 METHOD C: Bulk Import (Fastest)');
console.log('1. Go to: https://vercel.com/iamfarzads-projects/fbc-master-v5');
console.log('2. Settings → Environment Variables');
console.log('3. Look for "Import" or "Bulk Add" option');
console.log('4. Upload your .env file directly\n');

console.log('📋 STEP 3: Verify Upload');
console.log('After uploading, run: pnpm verify-env\n');

console.log('📋 STEP 4: Deploy');
console.log('vercel --prod\n');

console.log('💡 TIP: If you see a bulk import option in Vercel dashboard, use that!');
console.log('   It\'s the fastest way to upload all 30 variables at once.');
