#!/usr/bin/env node

/**
 * Setup Custom Domain for FBC Master V5
 * Professional domain and SSL setup
 */

console.log('🔗 Setting up Custom Domain for FBC Master V5...\n');

console.log('📋 STEP 1: Choose Your Domain');
console.log('Recommended options:');
console.log('├── fbc-master.com (Professional)');
console.log('├── fbc-consulting.com (Business)');
console.log('├── farzadbayat.com (Personal brand)');
console.log('└── fbclab.com (Short & memorable)\n');

console.log('📋 STEP 2: Purchase Domain (if needed)');
console.log('Popular registrars:');
console.log('├── Namecheap (Good prices)');
console.log('├── Google Domains (Simple)');
console.log('├── Cloudflare (Free privacy)');
console.log('└── GoDaddy (Widely used)\n');

console.log('📋 STEP 3: Add Domain to Vercel');
console.log('1. Go to: https://vercel.com/iamfarzads-projects/fbc-master-v5');
console.log('2. Navigate to: Settings → Domains');
console.log('3. Click "Add Domain"');
console.log('4. Enter your domain (e.g., fbc-master.com)');
console.log('5. Follow Vercel\'s DNS configuration\n');

console.log('📋 STEP 4: Configure DNS Records');
console.log('Add these records to your domain registrar:');
console.log('');
console.log('Type: A');
console.log('Name: @');
console.log('Value: 76.76.19.34');
console.log('');
console.log('Type: CNAME');
console.log('Name: www');
console.log('Value: cname.vercel-dns.com\n');

console.log('📋 STEP 5: SSL & Security');
console.log('✅ Vercel automatically provides SSL certificates');
console.log('✅ HTTPS enforcement');
console.log('✅ Security headers (already configured)');
console.log('✅ DDoS protection\n');

console.log('🎯 BENEFITS:');
console.log('✅ Professional appearance');
console.log('✅ Better SEO');
console.log('✅ Brand recognition');
console.log('✅ SSL security');
console.log('✅ Custom email addresses');

console.log('\n💡 TIP: Start with a simple domain like "fbc-master.com"');
console.log('   You can always add more subdomains later!');
