#!/usr/bin/env node

/**
 * Docker-based Cache Functions Fix
 * Uses Docker to connect to Supabase and execute the SQL
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
  const sqlPath = path.join(__dirname, 'final-cache-fix.sql');
  try {
    return fs.readFileSync(sqlPath, 'utf8');
  } catch (error) {
    logError(`Failed to read SQL file: ${error.message}`);
    return null;
  }
}

// Execute SQL using Docker and psql
function executeSQLWithDocker(sql) {
  return new Promise((resolve, reject) => {
    logStep('Executing SQL using Docker and psql...');

    // Create a temporary SQL file
    const tempSqlPath = path.join(__dirname, 'temp-cache-fix.sql');
    fs.writeFileSync(tempSqlPath, sql);

    // Get Supabase connection details from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      reject(new Error('Missing Supabase environment variables'));
      return;
    }

    // Parse the Supabase URL to get connection details
    const url = new URL(supabaseUrl);
    const host = url.host;
    const dbname = host.split('.')[0]; // Extract database name from host

    // Use psql via Docker to connect to Supabase
    const dockerCmd = spawn('docker', [
      'run', '--rm', '-i',
      '--env', `PGPASSWORD=${serviceRoleKey}`,
      'postgres:15-alpine',
      'psql',
      '-h', host,
      '-U', 'postgres', // Supabase uses postgres user
      '-d', dbname,
      '-f', '/dev/stdin'
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });

    let output = '';
    let errorOutput = '';

    dockerCmd.stdout.on('data', (data) => {
      output += data.toString();
      logInfo(`Docker Output: ${data.toString().trim()}`);
    });

    dockerCmd.stderr.on('data', (data) => {
      errorOutput += data.toString();
      logInfo(`Docker Info: ${data.toString().trim()}`);
    });

    dockerCmd.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempSqlPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code === 0) {
        logSuccess('SQL executed successfully via Docker!');
        resolve(output);
      } else {
        logError(`Docker command failed with code ${code}`);
        logInfo('Error output:', errorOutput);
        reject(new Error(`Docker command failed: ${errorOutput}`));
      }
    });

    // Send SQL to Docker container
    logInfo('Sending SQL to Docker container...');
    dockerCmd.stdin.write(sql);
    dockerCmd.stdin.end();

    // Timeout after 60 seconds
    setTimeout(() => {
      dockerCmd.kill();
      reject(new Error('Docker command timed out'));
    }, 60000);
  });
}

// Main execution
async function main() {
  logHeader('Docker-based Cache Functions Fix');

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

    // Try Docker execution
    logStep('Attempting Docker execution...');
    await executeSQLWithDocker(sql);

    logSuccess('Cache functions fixed successfully!');

    logHeader('Next Steps');
    logSuccess('All cache functions have been recreated successfully!');
    logInfo('Now test with:');
    logInfo('  node scripts/test-cron-setup.js');

    logInfo('\nAvailable cache functions:');
    logInfo('• public.get_cache(cache_key) → JSONB');
    logInfo('• public.update_cache(cache_key, value, ttl) → VOID');
    logInfo('• public.set_cache(cache_key, value, ttl) → VOID');
    logInfo('• public.clear_cache(cache_key) → INTEGER');

  } catch (error) {
    logError('Script failed:');
    logError(error.message);

    logInfo('\nFallback: Run the SQL manually in Supabase Dashboard');
    logInfo('1. Go to: https://supabase.com/dashboard');
    logInfo('2. Select your project: ksmxqswuzrmdgckwxkvn');
    logInfo('3. Go to SQL Editor');
    logInfo('4. Copy and paste the SQL from scripts/final-cache-fix.sql');

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readSQLFile,
  executeSQLWithDocker
};
