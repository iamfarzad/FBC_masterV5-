// Edge Function for Ultra-Fast Real-Time AI Streaming
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface RealtimeChatRequest {
  message: string
  sessionId?: string
  context?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const { message, sessionId = 'demo-session', context = {} }: RealtimeChatRequest = await request.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment - Edge Functions need explicit access
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_SERVER

    // API key is valid according to user - proceed with Live API

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Use the correct Gemini streaming API endpoint
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'text/plain'
        },
        systemInstruction: {
          parts: [{
            text: `You are F.B/c AI, an AI consultant demonstrating advanced AI capabilities.
            Be helpful, professional, and showcase your AI expertise.
            Session: ${sessionId}
            Context: ${JSON.stringify(context)}`
          }]
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    // Stream the response directly to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          let buffer = ''
          let currentObject = null
          let braceCount = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Accumulate chunks in buffer
            buffer += new TextDecoder().decode(value)

            // Process buffer to extract complete JSON objects
            let i = 0
            while (i < buffer.length) {
              const char = buffer[i]

              if (char === '{') {
                if (braceCount === 0) {
                  currentObject = char
                } else {
                  currentObject += char
                }
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (currentObject !== null) {
                  currentObject += char
                  if (braceCount === 0) {
                    // We have a complete JSON object
                    try {
                      const data = JSON.parse(currentObject)
                      console.log('Complete Gemini response:', JSON.stringify(data, null, 2))

                      // Extract text from Gemini response
                      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const text = data.candidates[0].content.parts[0].text
                        console.log('Extracted text:', text)

                        // Send as SSE format to client
                        controller.enqueue(
                          new TextEncoder().encode(`data: ${JSON.stringify({
                            id: Date.now(),
                            type: 'text',
                            data: text
                          })}\n\n`)
                        )
                      }

                      currentObject = null
                    } catch (parseError) {
                      console.log('Failed to parse complete object:', currentObject, parseError)
                      currentObject = null
                    }
                  }
                }
              } else if (currentObject !== null) {
                currentObject += char
              }

              i++
            }

            // Clean up processed buffer
            if (currentObject === null) {
              buffer = ''
            } else if (braceCount > 0) {
              // Keep incomplete object in buffer
              buffer = currentObject
              currentObject = null
            }
          }

          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              id: 'done',
              type: 'done',
              data: null
            })}\n\n`)
          )

        } catch (error) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              id: 'error',
              type: 'error',
              data: 'Streaming error occurred'
            })}\n\n`)
          )
        } finally {
          controller.close()
          reader.releaseLock()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })

  } catch (error) {
    console.error('Real-time chat error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  })
}
