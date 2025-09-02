# MCP (Model Context Protocol) Setup Guide

## Overview
This project uses multiple MCP servers for enhanced AI capabilities:
- **BrowserTools MCP**: Browser automation and debugging
- **Supabase MCP**: Database operations and real-time features
- **PostgREST MCP**: Direct database queries and management

## Configuration

### 1. Environment Variables
Set these in your `.env.local` file:

```bash
# Supabase MCP Configuration
SUPABASE_ACCESS_TOKEN=your-supabase-access-token-here
SUPABASE_PROJECT_ID=your-supabase-project-id-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 2. Getting Supabase Access Token
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your `service_role` key (this is your access token)

### 3. Cursor MCP Configuration
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

## Troubleshooting

### Common Issues

1. **Access Token Invalid**
   - Verify your `SUPABASE_ACCESS_TOKEN` is correct
   - Ensure it has the necessary permissions

2. **Port Conflicts**
   - Bridge: 3025
   - Next.js: 3000
   - WebSocket: 3001

3. **MCP Server Not Found**
   - Restart Cursor after configuration changes
   - Check that servers are running

### Debug Commands

```bash
# Test MCP servers
pnpm run supabase-mcp-setup

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

1. Set up your environment variables
2. Start the MCP servers
3. Test with Cursor AI
4. Explore database operations via MCP
