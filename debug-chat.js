// Debug script to test chat functionality
const testChatAPI = async () => {
  // Log removed

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 1,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message'
          }
        ]
      })
    });

    // Log removed
    // Log removed));

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Log removed
      }
    }
  } catch (error) {
    // Error: Error
  }
};

testChatAPI();
