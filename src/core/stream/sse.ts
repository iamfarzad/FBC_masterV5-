export function sseFromAsyncIterable(source: AsyncIterable<string>) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const iterator = source[Symbol.asyncIterator]()
      
      try {
        while (true) {
          const { value, done } = await iterator.next()
          
          if (done) {
            controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`))
            controller.close()
            return
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      } finally {
        await iterator.return?.()
      }
    },
    
    cancel() {
      // Iterator cleanup is handled in the finally block above
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    }
  })
}