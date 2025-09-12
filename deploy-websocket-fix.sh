#!/bin/bash

# Deploy WebSocket server fix to Fly.io

set -e

echo "🚀 Deploying WebSocket server fix to Fly.io..."

# Navigate to server directory
cd server

# Check if fly CLI is available
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "📝 Please log in to Fly.io:"
    fly auth login
fi

echo "🔍 Checking current app status..."
fly status -a fb-consulting-websocket

echo "🔐 Checking environment variables..."
fly secrets list -a fb-consulting-websocket

echo "📊 Current configuration:"
cat fly.toml

echo ""
echo "🚢 Deploying updated WebSocket server..."
fly deploy -a fb-consulting-websocket

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

echo "🔍 Testing health endpoint..."
curl -I https://fb-consulting-websocket.fly.dev/health

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📌 WebSocket Server URL: wss://fb-consulting-websocket.fly.dev"
echo ""
echo "🧪 Test the WebSocket connection from your app now!"
echo ""
echo "📊 Monitor logs: fly logs -a fb-consulting-websocket"
echo "📈 Check status: fly status -a fb-consulting-websocket"