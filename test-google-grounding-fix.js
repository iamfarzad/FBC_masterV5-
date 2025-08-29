/**
 * Test script to verify Google Grounding URL Context fix
 */

const { GoogleGroundingProvider } = require('./src/core/intelligence/providers/search/google-grounding.ts')

async function testURLContext() {
  console.log('🧪 Testing Google Grounding URL Context Fix...')

  try {
    const provider = new GoogleGroundingProvider()

    // Test 1: Search without URLs
    console.log('\n📝 Test 1: Search without URLs')
    const result1 = await provider.groundedAnswer('What is React?')
    console.log('✅ Search result:', result1.text.substring(0, 100) + '...')
    console.log('📊 Citations:', result1.citations.length)

    // Test 2: Search with URLs (your use case)
    console.log('\n🔗 Test 2: Search with URLs (Client Document Analysis)')
    const urls = [
      'https://react.dev',
      'https://react.dev/learn',
      'https://react.dev/reference/react'
    ]

    const result2 = await provider.groundedAnswer(
      'Explain React components and how they work',
      urls
    )

    console.log('✅ URL Context result:', result2.text.substring(0, 150) + '...')
    console.log('📊 Total Citations:', result2.citations.length)

    // Check URL citations
    const urlCitations = result2.citations.filter(c => c.source === 'url')
    const searchCitations = result2.citations.filter(c => c.source === 'search')

    console.log('🔗 URL Citations:', urlCitations.length)
    console.log('🔍 Search Citations:', searchCitations.length)

    if (urlCitations.length > 0) {
      console.log('✅ URL Context working! Found citations from provided URLs:')
      urlCitations.forEach((citation, i) => {
        console.log(`  ${i+1}. ${citation.title} (${citation.uri})`)
      })
    }

    console.log('\n🎉 Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)

    // Check if it's API key issue
    if (error.message.includes('GEMINI_API_KEY')) {
      console.log('💡 Note: Set GEMINI_API_KEY environment variable to run this test')
    }
  }
}

// Run test
testURLContext()
