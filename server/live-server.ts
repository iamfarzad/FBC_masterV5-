import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const PORT = process.env.WS_PORT || 3001

interface Client {
  id: string
  ws: any
  conversationId?: string
}

class LiveServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, Client> = new Map()

  start() {
    const server = createServer()
    this.wss = new WebSocketServer({ server })

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId()
      const client: Client = { id: clientId, ws }
      
      this.clients.set(clientId, client)
      console.log(`Client connected: ${clientId}`)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(client, message)
        } catch (error) {
          console.error('Invalid message format:', error)
          ws.send(JSON.stringify({ error: 'Invalid message format' }))
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
        console.log(`Client disconnected: ${clientId}`)
      })

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error)
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      }))
    })

    server.listen(PORT, () => {
      console.log(`WebSocket server running on port ${PORT}`)
    })
  }

  private handleMessage(client: Client, message: any) {
    switch (message.type) {
      case 'join':
        client.conversationId = message.conversationId
        this.broadcast(message.conversationId, {
          type: 'user_joined',
          clientId: client.id,
          timestamp: new Date().toISOString()
        }, client.id)
        break

      case 'message':
        this.broadcast(client.conversationId, {
          type: 'message',
          clientId: client.id,
          content: message.content,
          timestamp: new Date().toISOString()
        })
        break

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }))
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }

  private broadcast(conversationId: string | undefined, message: any, excludeClientId?: string) {
    if (!conversationId) return

    this.clients.forEach((client) => {
      if (client.conversationId === conversationId && client.id !== excludeClientId) {
        client.ws.send(JSON.stringify(message))
      }
    })
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Start server if running directly
if (require.main === module) {
  const server = new LiveServer()
  server.start()
}

export default LiveServer