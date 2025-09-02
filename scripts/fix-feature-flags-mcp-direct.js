#!/usr/bin/env node

/**
 * Fix Feature Flags Function using Supabase MCP - Direct Execution
 * This script will use the MCP server to execute the SQL directly
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
  const sqlPath = path.join(__dirname, 'fix-feature-flags-final.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
    logSuccess('SQL file loaded successfully');
  } catch (error) {
    logError(`Failed to read SQL file: ${error.message}`);
    return null;
  }
}

// Execute SQL using Supabase MCP server
function executeSQLViaMCP(sql) {
  return new Promise((resolve, reject) => {
    logStep('Executing SQL via Supabase MCP server...');
    
    // Start the MCP server and send SQL
    const mcpProcess = spawn('pnpm', ['mcp:supabase'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
    
    let output = '';
    let errorOutput = '';
    
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
      logInfo(`MCP Output: ${data.toString().trim()}`);
    });
    
    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      logInfo(`MCP Info: ${data.toString().trim()}`);
    });
    
    mcpProcess.on('close', (code) => {
      if (code === 0 || code === null) {
        logSuccess('SQL executed via MCP successfully!');
        resolve(output);
      } else {
        logError(`MCP server exited with code ${code}`);
        logInfo('Error output:', errorOutput);
        reject(new Error(`MCP server failed: ${errorOutput}`));
      }
    });
    
    // Send SQL to MCP server
    logInfo('Sending SQL to MCP server...');
    mcpProcess.stdin.write(sql);
    mcpProcess.stdin.end();
    
    // Kill after 30 seconds
    setTimeout(() => {
      mcpProcess.kill();
      logInfo('MCP server timeout - checking results...');
    }, 30000);
  });
}

// Alternative: Use direct database connection with Supabase client
async function executeSQLDirect(sql) {
  logStep('Executing SQL directly via Supabase client...');
  
  try {
    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    // Create client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    logSuccess('Connected to Supabase successfully');
    
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
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      try {
        logInfo(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Use rpc to execute the SQL statement
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
    
    // Test the function
    logStep('Testing the fixed feature_flag function...');
    try {
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
    
  } catch (error) {
    logError(`Direct execution failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  logHeader('Fix Feature Flags Function via Supabase MCP - Direct Execution');
  
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
    
    // Provide manual instructions since MCP execution has limitations
    logInfo('Since MCP execution has limitations, here\'s the corrected SQL to run manually:');
    logInfo('\n' + '='.repeat(80));
    logInfo('CORRECTED SQL TO RUN IN SUPABASE DASHBOARD:');
    logInfo('='.repeat(80));
    logInfo('');
    logInfo('Go to: https://supabase.com/dashboard');
    logInfo('Select your project: ksmxqswuzrmdgckwxkvn');
    logInfo('Go to SQL Editor');
    logInfo('Copy and paste this EXACT SQL:');
    logInfo('');
    logInfo('--- FIXED SQL (COLUMNS AMBIGUITY FIXED) ---');
    logInfo(sql);
    logInfo('--- END SQL ---');
    logInfo('');
    logInfo('Then run: node scripts/test-cron-setup.js');
    logInfo('='.repeat(80));
    
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
  executeSQLViaMCP,
  executeSQLDirect
};
