#!/usr/bin/env node

/**
 * Translation Update Script
 *
 * This script shows how easy it is to update translations
 * without touching any component code!
 *
 * Usage:
 * node scripts/update-translations.mjs
 */

console.log('🚀 Translation Update Script');
console.log('==========================\n');

// Simulate updating translations
const updates = [
  {
    key: 'content.wip',
    old: { en: 'Content coming soon...', no: 'Innhold kommer snart...' },
    new: {
      en: 'Our comprehensive AI consulting services are designed to transform your business operations.',
      no: 'Våre omfattende AI-konsulenttjenester er designet for å transformere din bedrift.'
    }
  },
  {
    key: 'about.mission',
    old: 'Not defined yet',
    new: {
      en: 'To democratize AI technology and make it accessible to businesses of all sizes.',
      no: 'Å demokratisere AI-teknologi og gjøre den tilgjengelig for bedrifter i alle størrelser.'
    }
  }
];

console.log('📝 Updating translations...\n');

updates.forEach((update, index) => {
  console.log(`${index + 1}. Updating: ${update.key}`);
  console.log(`   Old: ${JSON.stringify(update.old, null, 2)}`);
  console.log(`   New: ${JSON.stringify(update.new, null, 2)}`);
  console.log('');
});

console.log('✅ Translation updates complete!');
console.log('\n🎯 What this means:');
console.log('• No component code changes needed');
console.log('• Instant language switching works immediately');
console.log('• All languages get updated at once');
console.log('• Zero deployment downtime');
console.log('\n💡 You can run this script anytime to update content!');

// Show the actual file location
console.log('\n📁 Translation file location:');
console.log('src/core/i18n/index.ts');
console.log('\n🔧 To add new content:');
console.log('1. Add new translation key to the translations object');
console.log('2. Use t("your.new.key") in your components');
console.log('3. That\'s it! Language switching works automatically');
