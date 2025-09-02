#!/usr/bin/env node

/**
 * Fix Caching Functions via Supabase MCP
 * This script provides the corrected SQL for the caching functions
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logStep(message) {
  log(`\n▶ ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Read the SQL file
function readSQLFile() {
  const sqlPath = path.join(__dirname, 'fix-caching-functions.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    logError(`Failed to read SQL file: ${error.message}`);
    return null;
  }
}

// Main execution
async function main() {
  logHeader('Fix Caching Functions via Supabase MCP');

  try {
    // Read SQL file
    const sql = readSQLFile();
    if (!sql) {
      process.exit(1);
    }

    logSuccess('SQL file loaded successfully');

    // Provide manual instructions
    logInfo('The caching functions have column ambiguity issues that need to be fixed manually.');
    logInfo('\nHere\'s the corrected SQL to run in Supabase Dashboard:');
    logInfo('\n' + '='.repeat(80));
    logInfo('FIXED CACHING FUNCTIONS SQL:');
    logInfo('='.repeat(80));
    logInfo('');
    logInfo('Go to: https://supabase.com/dashboard');
    logInfo('Select your project: ksmxqswuzrmdgckwxkvn');
    logInfo('Go to SQL Editor');
    logInfo('Copy and paste this EXACT SQL:');
    logInfo('');
    logInfo('--- FIXED CACHING SQL (AMBIGUITY FIXED) ---');
    logInfo(sql);
    logInfo('--- END SQL ---');
    logInfo('');
    logInfo('Then run: node scripts/test-cron-setup.js');
    logInfo('='.repeat(80));

    logHeader('What Was Fixed');
    logSuccess('✅ Renamed parameters to avoid column ambiguity');
    logSuccess('✅ Fixed update_cache function');
    logSuccess('✅ Fixed get_cache function');
    logSuccess('✅ Fixed clear_cache function');
    logSuccess('✅ Fixed set_cache function');
    logInfo('');
    logInfo('After running this SQL, your caching system will work perfectly!');

  } catch (error) {
    logError('Script failed:');
    logError(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readSQLFile
};
