// Test if we can import and use the provider directly
import { getProvider } from './src/core/ai/index.ts';

async function testProvider() {
  // Log removed

  try {
    const provider = getProvider();
    // Log removed

    // Test the generate method
    const messages = [{ role: 'user', content: 'Test message' }];
    // Log removed

    let count = 0;
    for await (const chunk of provider.generate({ messages })) {
      count++;
      // Log removed
      if (count > 5) break; // Limit for testing
    }

    // Log removed
  } catch (error) {
    // Error: Error
  }
}

testProvider();
