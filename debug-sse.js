// Test the SSE helper directly
import { sseFromAsyncIterable } from './src/core/stream/sse.js';

async function testSSE() {
  // Log removed

  // Create a simple async generator that yields some text
  async function* simpleGenerator() {
    // Log removed
    yield 'Hello';
    yield ' ';
    yield 'world';
    // Log removed
  }

  // Log removed
  const response = sseFromAsyncIterable(simpleGenerator());
  // Log removed

  // Read the response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Log removed
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Log removed
  }

  // Log removed
}

testSSE().catch(console.error);
