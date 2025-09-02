# 🚀 Supabase MCP Quick Start

## What You Get

✅ **Official Supabase MCP Server** - Full database operations  
✅ **PostgREST MCP Server** - Direct SQL queries  
✅ **BrowserTools MCP** - Browser automation  
✅ **Complete Setup Scripts** - One-command configuration  

## 🎯 Quick Setup

### 1. Get Your Supabase Access Token
```bash
# Go to https://supabase.com/dashboard
# Settings → API → Copy service_role key
```

### 2. Set Environment Variables
```bash
# Add to .env.local
SUPABASE_ACCESS_TOKEN=your-service-role-key-here
SUPABASE_URL=your-project-url-here
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Setup Script
```bash
pnpm supabase-mcp-setup
```

### 4. Start All MCP Servers
```bash
pnpm mcp:supabase:dev
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm mcp:supabase` | Supabase MCP server |
| `pnpm mcp:postgrest` | PostgREST MCP server |
| `pnpm mcp:bridge` | BrowserTools bridge |
| `pnpm mcp:server` | BrowserTools MCP |
| `pnpm mcp:supabase:dev` | All servers together |

## 🎨 What You Can Do

### Supabase MCP
- Query your database
- Manage real-time subscriptions
- Handle file storage
- Manage authentication

### PostgREST MCP
- Run SQL queries directly
- Inspect database schema
- Manage tables and rows
- Handle row-level security

### BrowserTools MCP
- Monitor console logs
- Track network requests
- Take screenshots
- Run performance audits

## 🚨 Important Notes

- **Access Token**: Use your `service_role` key (full access)
- **Security**: Never commit `.env.local` files
- **Ports**: Bridge (3025), Next.js (3000), WS (3001)
- **Restart**: Restart Cursor after MCP config changes

## 📚 Full Documentation

See `docs/MCP_SETUP.md` for complete setup and troubleshooting guide.

## 🆘 Need Help?

1. Check environment variables: `pnpm verify-env`
2. Test MCP servers: `pnpm supabase-mcp-setup`
3. Monitor processes: `pnpm dev:check`
4. Check logs in terminal output

---

**Ready to supercharge your AI with Supabase?** 🚀
