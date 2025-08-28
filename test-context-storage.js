#!/usr/bin/env node

// Direct test of ContextStorage fallback mechanism
const { ContextStorage } = require('./src/core/context/context-storage.ts');

async function testContextStorageDirectly() {
  console.log('🔧 Testing ContextStorage Fallback Mechanism...\n');

  const contextStorage = new ContextStorage();
  const testSessionId = 'test-direct-storage';

  try {
    // Step 1: Try to get non-existent context
    console.log('Step 1: Getting non-existent context...');
    const initialContext = await contextStorage.get(testSessionId);
    console.log('Initial context:', initialContext);

    // Step 2: Store some context data
    console.log('\nStep 2: Storing context data...');
    await contextStorage.store(testSessionId, {
      email: 'test@example.com',
      name: 'Test User',
      company_url: 'https://example.com'
    });

    // Step 3: Retrieve the stored context
    console.log('\nStep 3: Retrieving stored context...');
    const storedContext = await contextStorage.get(testSessionId);
    console.log('Stored context:', JSON.stringify(storedContext, null, 2));

    // Step 4: Update the context
    console.log('\nStep 4: Updating context...');
    await contextStorage.update(testSessionId, {
      role: 'Developer',
      role_confidence: 0.8
    });

    // Step 5: Get updated context
    console.log('\nStep 5: Getting updated context...');
    const updatedContext = await contextStorage.get(testSessionId);
    console.log('Updated context:', JSON.stringify(updatedContext, null, 2));

    console.log('\n✅ ContextStorage fallback mechanism test completed successfully!');

  } catch (error) {
    console.error('❌ ContextStorage test failed:', error);
  }
}

// Run the direct test
testContextStorageDirectly().catch(console.error);
