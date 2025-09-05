# WebSocket Deployment Guide

## ✅ Server Setup Complete

Your WebSocket server has been successfully restored from V2 and adapted for V5. Here's what we accomplished:

### 🔧 **Technical Updates Made:**
- ✅ **ESM Configuration**: Updated to `"type": "module"` with NodeNext resolution
- ✅ **SDK Alignment**: Using `@google/genai` v1.13.0 (matches V5)
- ✅ **Model Updated**: `gemini-2.5-flash-preview-native-audio-dialog`
- ✅ **Dependencies**: Updated to latest compatible versions
- ✅ **Environment**: Created `.env.local` template with proper variables
- ✅ **Local Testing**: ✅ Server runs on `ws://localhost:3001` and responds to health checks

## 🚀 **Deploy to Fly.io**

### 1. Set Your Gemini API Key
```bash
# In server/.env.local
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 2. Deploy to Fly.io
```bash
# From project root
pnpm deploy:websocket
```

This will:
- Set `GEMINI_API_KEY` as a Fly.io secret
- Deploy the WebSocket server to `fb-consulting-websocket.fly.dev`
- Configure SSL/TLS automatically

### 3. Verify Deployment
```bash
# Check status
fly status

# View logs
fly logs
```

## 🔧 **Update Vercel Environment Variables**

In your Vercel dashboard (Project Settings → Environment Variables):

```bash
NEXT_PUBLIC_LIVE_SERVER_URL=wss://fb-consulting-websocket.fly.dev
NEXT_PUBLIC_GEMINI_DIRECT=0
LIVE_ENABLED=true
```

## 🧪 **Test End-to-End**

### Local Testing (before deploying):
```bash
# Terminal 1: Start WebSocket server
cd server && GEMINI_API_KEY=test npm run dev

# Terminal 2: Start Next.js app
pnpm dev

# Set local env var for testing
NEXT_PUBLIC_LIVE_SERVER_URL=ws://localhost:3001
```

### Production Testing:
1. Open `/chat` in your browser
2. Click the voice orb
3. Check browser console for WebSocket connection
4. Speak and verify responses

## 📊 **Architecture Overview**

```
Browser Client (Vercel)
    │
    ├── Direct Gemini Live API (NEXT_PUBLIC_GEMINI_DIRECT=1)
    │   └── useGeminiLiveAudio.ts → genAI.live.connect()
    │
    └── Fly.io WebSocket Proxy (NEXT_PUBLIC_GEMINI_DIRECT=0) ⭐ RECOMMENDED
        ├── use-websocket-voice.ts → wss://fb-consulting-websocket.fly.dev
        └── server/live-server.ts → Gemini Live API proxy
```

## 🔍 **Key Features Restored:**

- ✅ **Real Gemini Live API integration** (not stub)
- ✅ **Audio streaming** with proper VAD
- ✅ **Token budgeting** and cost tracking
- ✅ **Session management** with context persistence
- ✅ **Health checks** and monitoring
- ✅ **Production SSL/TLS** on fly.io

## 🚨 **Important Notes:**

1. **Security**: Never expose `GEMINI_API_KEY` to the browser - it's only on the Fly.io server
2. **Model**: Using audio-native model for best voice quality
3. **Sample Rate**: 16kHz PCM16 mono throughout the pipeline
4. **Fallback**: Server includes mock mode for testing without API keys

## 🎯 **Next Steps:**

1. **Deploy**: Run `pnpm deploy:websocket`
2. **Configure Vercel**: Add the environment variables
3. **Test**: Voice/Webcam/Screen share through the same WebSocket session
4. **Monitor**: Check Fly.io logs for any issues

Your Gemini Live WebSocket is now production-ready! 🚀
