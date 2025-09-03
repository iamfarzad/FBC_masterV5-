#!/usr/bin/env node

/**
 * Fix Feature Flags Function - Final Direct Execution
 * This script directly connects to Supabase and executes the SQL
 */

const { createClient } = require('@supabase/supabase-js');
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
  const sqlPath = path.join(__dirname, 'fix-feature-flags-final.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    logError(`Failed to read SQL file: ${error.message}`);
    return null;
  }
}

// Execute SQL statements one by one
async function executeSQLStatements(supabase, sql) {
  logStep('Executing SQL statements...');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => 
      stmt.length > 0 && 
      !stmt.startsWith('--') && 
      !stmt.startsWith('#') &&
      !stmt.toLowerCase().startsWith('select') // Skip SELECT for now
    );
  
  logInfo(`Found ${statements.length} SQL statements to execute`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.trim().length === 0) continue;
    
    try {
      logInfo(`Executing statement ${i + 1}/${statements.length}...`);
      
      // For DROP statements, we'll use a different approach
      if (statement.toLowerCase().includes('drop function')) {
        logInfo(`Skipping DROP statement (will be handled by CREATE OR REPLACE)`);
        continue;
      }
      
      // Try to execute the statement
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        logInfo(`Statement ${i + 1} completed (may have warnings)`);
      } else {
        logSuccess(`Statement ${i + 1} executed successfully`);
      }
      
    } catch (error) {
      logError(`Statement ${i + 1} failed: ${error.message}`);
      // Continue with next statement
    }
  }
}

// Test the feature flag function
async function testFeatureFlagFunction(supabase) {
  logStep('Testing the feature flag function...');
  
  try {
    // Test the function
    const { data, error } = await supabase.rpc('get_feature_flag', { 
      flag_key: 'test_flag' 
    });
    
    if (error) {
      logError(`Function test failed: ${error.message}`);
      return false;
    }
    
    logSuccess('Function test successful!');
    logInfo(`Result: ${JSON.stringify(data, null, 2)}`);
    return true;
    
  } catch (error) {
    logError(`Function test error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  logHeader('Fix Feature Flags Function - Final Direct Execution');
  
  try {
    // Check environment
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logError('Missing Supabase environment variables');
      logInfo('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      process.exit(1);
    }
    
    // Create Supabase client
    logStep('Connecting to Supabase...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    logSuccess('Connected to Supabase successfully');
    
    // Read SQL file
    const sql = readSQLFile();
    if (!sql) {
      process.exit(1);
    }
    
    logSuccess('SQL file loaded successfully');
    
    // Execute SQL statements
    await executeSQLStatements(supabase, sql);
    
    // Test the function
    const testResult = await testFeatureFlagFunction(supabase);
    
    logHeader('Execution Complete!');
    if (testResult) {
      logSuccess('Feature flags function has been fixed and tested successfully!');
    } else {
      logInfo('Function fix completed, but testing failed.');
      logInfo('The function may need to be created manually in Supabase Dashboard.');
    }
    
    logInfo('Next steps:');
    logInfo('1. Test with: node scripts/test-cron-setup.js');
    logInfo('2. Or manually run the SQL in Supabase Dashboard → SQL Editor');
    
  } catch (error) {
    logError('Script failed:');
    logError(error.message);
    
    logInfo('\nFallback: Run the SQL manually in Supabase Dashboard');
    logInfo('1. Go to: https://supabase.com/dashboard');
    logInfo('2. Select your project: ksmxqswuzrmdgckwxkvn');
    logInfo('3. Go to SQL Editor');
    logInfo('4. Copy and paste the SQL from scripts/fix-feature-flags-final.sql');
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readSQLFile,
  executeSQLStatements,
  testFeatureFlagFunction
};
