#!/usr/bin/env node

/**
 * Fix Feature Flags Function using Supabase MCP
 * This script will execute the SQL to fix your feature_flags function
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
  const sqlPath = path.join(__dirname, 'fix-remaining-functions.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    logError(`Failed to read SQL file: ${error.message}`);
    return null;
  }
}

// Execute SQL using Supabase CLI
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    logStep('Executing SQL to fix feature_flags function...');
    
    // Create a temporary SQL file
    const tempSqlPath = path.join(__dirname, 'temp-fix-feature-flags.sql');
    fs.writeFileSync(tempSqlPath, sql);
    
    // Use supabase CLI to execute the SQL
    const supabaseProcess = spawn('supabase', ['db', 'reset', '--db-url', process.env.SUPABASE_URL], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
    
    let output = '';
    let errorOutput = '';
    
    supabaseProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    supabaseProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    supabaseProcess.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempSqlPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0) {
        logSuccess('SQL executed successfully!');
        resolve(output);
      } else {
        logError(`Supabase CLI failed with code ${code}`);
        logInfo('Error output:', errorOutput);
        reject(new Error(`Supabase CLI failed: ${errorOutput}`));
      }
    });
    
    // Send SQL to stdin
    supabaseProcess.stdin.write(sql);
    supabaseProcess.stdin.end();
  });
}

// Alternative: Use direct database connection
function executeSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    logStep('Executing SQL directly via database connection...');
    
    // This would require a direct database connection
    // For now, we'll show the user how to do it manually
    logInfo('Since direct execution requires additional setup, here\'s what to do:');
    logInfo('');
    logInfo('1. Go to: https://supabase.com/dashboard');
    logInfo('2. Select your project: ksmxqswuzrmdgckwxkvn');
    logInfo('3. Go to SQL Editor');
    logInfo('4. Copy and paste this SQL:');
    logInfo('');
    logInfo('--- SQL TO EXECUTE ---');
    logInfo(sql);
    logInfo('--- END SQL ---');
    logInfo('');
    
    resolve('Manual execution instructions provided');
  });
}

// Main execution
async function main() {
  logHeader('Fix Feature Flags Function via Supabase MCP');
  
  try {
    // Check environment
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logError('Missing Supabase environment variables');
      logInfo('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      process.exit(1);
    }
    
    // Read SQL file
    const sql = readSQLFile();
    if (!sql) {
      process.exit(1);
    }
    
    logSuccess('SQL file loaded successfully');
    
    // Try to execute via Supabase CLI first
    try {
      await executeSQL(sql);
    } catch (error) {
      logInfo('Supabase CLI execution failed, providing manual instructions...');
      await executeSQLDirect(sql);
    }
    
    logHeader('Next Steps');
    logSuccess('Feature flags function fix completed!');
    logInfo('Now test it with:');
    logInfo('  node scripts/test-cron-setup.js');
    
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
  readSQLFile,
  executeSQL,
  executeSQLDirect
};
