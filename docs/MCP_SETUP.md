# MCP (Model Context Protocol) Setup Guide

## Overview
This project uses multiple MCP servers for enhanced AI capabilities:
- **BrowserTools MCP**: Browser automation and debugging
- **Supabase MCP**: Database operations and real-time features
- **PostgREST MCP**: Direct database queries and management
- **Figma Developer MCP**: Access to Figma design files and components

## Configuration

### 1. Environment Variables
Set these in your `.env.local` file:

```bash
# Supabase MCP Configuration
SUPABASE_ACCESS_TOKEN=your-supabase-access-token-here
SUPABASE_PROJECT_ID=your-supabase-project-id-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Figma MCP Configuration
FIGMA_API_KEY=your-figma-personal-access-token-here
# OR (alternative to API key)
FIGMA_OAUTH_TOKEN=your-figma-oauth-bearer-token-here
```

### 2. Getting Supabase Access Token
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your `service_role` key (this is your access token)

### 3. Getting Figma API Key
1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to "Personal access tokens"
3. Click "Create a new personal access token"
4. Give it a descriptive name (e.g., "Figma MCP Integration")
5. Copy the generated token (this is your `FIGMA_API_KEY`)

**Note**: You can use either `FIGMA_API_KEY` (Personal Access Token) or `FIGMA_OAUTH_TOKEN` (OAuth Bearer token). Personal Access Tokens are recommended for most use cases.

### 4. Cursor MCP Configuration
The MCP servers are configured in `.cursor/mcp-servers.json`.

## Usage

### Start MCP Servers

```bash
# Start all MCP servers (recommended)
pnpm mcp:supabase:dev

# Start individual servers
pnpm mcp:bridge          # BrowserTools bridge
pnpm mcp:server          # BrowserTools MCP
pnpm mcp:supabase        # Supabase MCP
pnpm mcp:postgrest       # PostgREST MCP
```

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

#### Figma Developer MCP
- Access Figma design files
- Extract components and styles
- Download images and assets
- Get design specifications
- Implement designs in code

## Troubleshooting

### Common Issues

1. **Access Token Invalid**
   - Verify your `SUPABASE_ACCESS_TOKEN` is correct
   - Ensure it has the necessary permissions

2. **Port Conflicts**
   - Bridge: 3025
   - Next.js: 3000
   - WebSocket: 3001
   - Figma MCP: 3002 (default, can be configured)

3. **MCP Server Not Found**
   - Restart Cursor after configuration changes
   - Check that servers are running

4. **Figma API Key Invalid**
   - Verify your `FIGMA_API_KEY` is correct and active
   - Ensure your Figma account has access to the target files
   - Check that the token hasn't expired

5. **Figma File Access Denied**
   - Ensure the Figma file is shared with your account
   - Verify the file URL format (should be like: `https://www.figma.com/file/[FILE_ID]/[FILE_NAME]`)
   - Check that your API key has the necessary permissions

### Debug Commands

```bash
# Test MCP servers
pnpm run supabase-mcp-setup

# Test Figma MCP connection
pnpm mcp:figma --help

# Check environment
pnpm verify-env

# Monitor processes
pnpm dev:check
```

## Security Notes

- Never commit `.env.local` files
- Access tokens have full database access
- Use service role keys only in development
- Consider using anon keys for production MCP access

## Next Steps

1. Set up your environment variables (Supabase + Figma)
2. Get your Figma Personal Access Token
3. Start the MCP servers (including Figma MCP)
4. Test with Cursor AI
5. Explore database operations via Supabase MCP
6. Access your Figma design files via Figma MCP
