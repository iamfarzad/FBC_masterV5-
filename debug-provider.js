// Debug script to test the provider directly
import { getProvider } from './src/core/ai/index.js';

const testProvider = async () => {
  // Log removed

  try {
    const provider = getProvider();
    // Log removed

    const messages = [
      {
        role: 'user',
        content: 'Hello, this is a test message'
      }
    ];

    // Log removed
    let chunkCount = 0;

    for await (const chunk of provider.generate({ messages })) {
      chunkCount++;
      // Log removed
    }

    // Log removed
  } catch (error) {
    // Error: Provider error
  }
};

testProvider();
