#!/usr/bin/env node

/**
 * Supabase MCP Server Setup Script
 * Configures and tests Supabase MCP servers for FBC Master V5
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
  magenta: '\x1b[35m',
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

// Check environment variables
function checkEnvironment() {
  logStep('Checking environment variables...');
  
  const requiredVars = [
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    logInfo('Please set these in your .env.local file or export them');
    return false;
  }
  
  logSuccess('All required environment variables are set');
  return true;
}

// Test Supabase MCP server
function testSupabaseMCP() {
  return new Promise((resolve, reject) => {
    logStep('Testing Supabase MCP server...');
    
    const mcpProcess = spawn('pnpm', ['mcp:supabase'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
    
    let output = '';
    let errorOutput = '';
    
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mcpProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('Supabase MCP server started successfully');
        resolve(true);
      } else {
        logError(`Supabase MCP server failed with code ${code}`);
        logInfo('Error output:', errorOutput);
        reject(new Error(`MCP server failed: ${errorOutput}`));
      }
    });
    
    // Kill after 5 seconds
    setTimeout(() => {
      mcpProcess.kill();
    }, 5000);
  });
}

// Test PostgREST MCP server
function testPostgRESTMCP() {
  return new Promise((resolve, reject) => {
    logStep('Testing PostgREST MCP server...');
    
    const mcpProcess = spawn('pnpm', ['mcp:postgrest'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
    
    let output = '';
    let errorOutput = '';
    
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mcpProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess('PostgREST MCP server started successfully');
        resolve(true);
      } else {
        logError(`PostgREST MCP server failed with code ${code}`);
        logInfo('Error output:', errorOutput);
        reject(new Error(`MCP server failed: ${errorOutput}`));
      }
    });
    
    // Kill after 5 seconds
    setTimeout(() => {
      mcpProcess.kill();
    }, 5000);
  });
}

// Create MCP configuration files
function createMCPConfigs() {
  logStep('Creating MCP configuration files...');
  
  // Create .cursor/mcp-servers.json if it doesn't exist
  const cursorDir = path.join(process.cwd(), '.cursor');
  const mcpConfigPath = path.join(cursorDir, 'mcp-servers.json');
  
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }
  
  const mcpConfig = {
    mcpServers: {
      "github.com/AgentDeskAI/browser-tools-mcp": {
        command: "pnpm",
        args: ["dlx", "@agentdeskai/browser-tools-mcp@1.2.0"],
        env: { "BROWSER_TOOLS_SERVER_URL": "http://localhost:3025" },
        disabled: false,
        autoApprove: [
          "getConsoleLogs",
          "getConsoleErrors", 
          "getNetworkLogs",
          "takeScreenshot",
          "runNextJSAudit"
        ],
        timeout: 1800
      },
      "supabase/mcp-server-supabase": {
        command: "pnpm",
        args: ["mcp:supabase"],
        env: { 
          "SUPABASE_ACCESS_TOKEN": "${SUPABASE_SERVICE_ROLE_KEY}",
          "SUPABASE_URL": "${SUPABASE_URL}"
        },
        disabled: false,
        timeout: 1800
      },
      "supabase/mcp-server-postgrest": {
        command: "pnpm", 
        args: ["mcp:postgrest"],
        env: {
          "SUPABASE_ACCESS_TOKEN": "${SUPABASE_SERVICE_ROLE_KEY}",
          "SUPABASE_URL": "${SUPABASE_URL}"
        },
        disabled: false,
        timeout: 1800
      }
    }
  };
  
  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  logSuccess('Created .cursor/mcp-servers.json');
  
  // Create MCP server configuration documentation
  const mcpDocsPath = path.join(process.cwd(), 'docs/MCP_SETUP.md');
  const mcpDocsDir = path.dirname(mcpDocsPath);
  
  if (!fs.existsSync(mcpDocsDir)) {
    fs.mkdirSync(mcpDocsDir, { recursive: true });
  }
  
  const mcpDocs = `# MCP (Model Context Protocol) Setup Guide

## Overview
This project uses multiple MCP servers for enhanced AI capabilities:
- **BrowserTools MCP**: Browser automation and debugging
- **Supabase MCP**: Database operations and real-time features
- **PostgREST MCP**: Direct database queries and management

## Configuration

### 1. Environment Variables
Set these in your \`.env.local\` file:

\`\`\`bash
# Supabase MCP Configuration
SUPABASE_ACCESS_TOKEN=your-supabase-access-token-here
SUPABASE_PROJECT_ID=your-supabase-project-id-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
\`\`\`

### 2. Getting Supabase Access Token
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your \`service_role\` key (this is your access token)

### 3. Cursor MCP Configuration
The MCP servers are configured in \`.cursor/mcp-servers.json\`.

## Usage

### Start MCP Servers

\`\`\`bash
# Start all MCP servers (recommended)
pnpm mcp:supabase:dev

# Start individual servers
pnpm mcp:bridge          # BrowserTools bridge
pnpm mcp:server          # BrowserTools MCP
pnpm mcp:supabase        # Supabase MCP
pnpm mcp:postgrest       # PostgREST MCP
\`\`\`

### Available Commands

#### Supabase MCP
- Database queries
- Real-time subscriptions
- Storage operations
- Authentication management

#### PostgREST MCP  
- Direct SQL queries
- Database schema inspection
- Table operations
- Row-level security

#### BrowserTools MCP
- Console logging
- Network monitoring
- Screenshots
- Performance audits

## Troubleshooting

### Common Issues

1. **Access Token Invalid**
   - Verify your \`SUPABASE_ACCESS_TOKEN\` is correct
   - Ensure it has the necessary permissions

2. **Port Conflicts**
   - Bridge: 3025
   - Next.js: 3000
   - WebSocket: 3001

3. **MCP Server Not Found**
   - Restart Cursor after configuration changes
   - Check that servers are running

### Debug Commands

\`\`\`bash
# Test MCP servers
pnpm run supabase-mcp-setup

# Check environment
pnpm verify-env

# Monitor processes
pnpm dev:check
\`\`\`

## Security Notes

- Never commit \`.env.local\` files
- Access tokens have full database access
- Use service role keys only in development
- Consider using anon keys for production MCP access

## Next Steps

1. Set up your environment variables
2. Start the MCP servers
3. Test with Cursor AI
4. Explore database operations via MCP
`;

  fs.writeFileSync(mcpDocsPath, mcpDocs);
  logSuccess('Created docs/MCP_SETUP.md');
}

// Main execution
async function main() {
  logHeader('Supabase MCP Server Setup');
  
  try {
    // Check environment
    if (!checkEnvironment()) {
      process.exit(1);
    }
    
    // Create configurations
    createMCPConfigs();
    
    // Test MCP servers
    logStep('Testing MCP servers...');
    
    await testSupabaseMCP();
    await testPostgRESTMCP();
    
    logHeader('Setup Complete!');
    logSuccess('Supabase MCP servers are configured and working');
    logInfo('Next steps:');
    logInfo('1. Restart Cursor to load MCP configuration');
    logInfo('2. Use pnpm mcp:supabase:dev to start all servers');
    logInfo('3. Check docs/MCP_SETUP.md for detailed usage');
    
  } catch (error) {
    logError('Setup failed:');
    logError(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  testSupabaseMCP,
  testPostgRESTMCP,
  createMCPConfigs
};
