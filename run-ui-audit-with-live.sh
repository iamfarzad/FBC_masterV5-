#!/bin/bash

# Enable live streaming for comprehensive UI audit
export LIVE_ENABLED=true

echo "🚀 Starting F.B/c UI Audit with Live Streaming Enabled"
echo "LIVE_ENABLED=$LIVE_ENABLED"

# Run the comprehensive UI audit
node ui-audit-comprehensive.js
