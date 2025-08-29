# Gemini Live API Configuration Guide

## Enabling Gemini Live API Direct Mode

To enable full Gemini Live API compliance with proper VAD, token counting, and modalities, add these environment variables to your `.env.local`:

```bash
# Enable Gemini Live API Direct Mode (bypasses proxy WebSocket)
NEXT_PUBLIC_GEMINI_DIRECT=1

# Gemini Model Configuration
NEXT_PUBLIC_GEMINI_MODEL=gemini-live-2.5-flash-preview-native-audio

# Optional: Override default voice
# NEXT_PUBLIC_VOICE_NAME=Puck

# Optional: Media resolution (LOW, MEDIUM, HIGH)
# NEXT_PUBLIC_MEDIA_RESOLUTION=LOW

# Optional: VAD sensitivity settings
# NEXT_PUBLIC_VAD_START_SENSITIVITY=START_SENSITIVITY_LOW
# NEXT_PUBLIC_VAD_END_SENSITIVITY=END_SENSITIVITY_LOW
# NEXT_PUBLIC_VAD_PREFIX_PADDING_MS=20
# NEXT_PUBLIC_VAD_SILENCE_DURATION_MS=100
```

## Features Enabled in Direct Mode

✅ **Proper Response Modalities**: Single modality per session (AUDIO only)
✅ **Automatic VAD**: Voice Activity Detection with configurable sensitivity
✅ **Token Counting**: Real-time usage tracking with modality breakdown
✅ **Media Resolution**: Configurable video quality settings
✅ **Session Limits**: 15min audio-only, 2min with video
✅ **Audio Output**: AI can talk back with native audio generation

## Session Management

- **Audio-only sessions**: 15 minutes maximum
- **Audio + video sessions**: 2 minutes maximum
- **Automatic reconnection** on unexpected disconnect
- **Proper session cleanup** on close

## VAD (Voice Activity Detection) Settings

```javascript
realtimeInputConfig: {
  automaticActivityDetection: {
    disabled: false,                    // Enable automatic VAD
    startOfSpeechSensitivity: 'START_SENSITIVITY_LOW',  // More sensitive
    endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',      // More sensitive
    prefixPaddingMs: 20,               // 20ms before detected speech
    silenceDurationMs: 100,            // 100ms silence to end speech
  }
}
```

## Usage Tracking

The system now tracks:
- Total token count per session
- Token breakdown by modality (audio, text, video)
- Real-time usage updates
- Cost optimization insights

## Security Notes

- Uses ephemeral tokens for client-side API access
- Automatic token refresh
- Secure WebSocket connections
- No API keys exposed to client

## Troubleshooting

1. **Connection Issues**: Ensure `NEXT_PUBLIC_GEMINI_DIRECT=1` is set
2. **Audio Not Working**: Check browser permissions and microphone access
3. **Token Errors**: Verify API key configuration and quotas
4. **VAD Problems**: Adjust sensitivity settings in environment variables
