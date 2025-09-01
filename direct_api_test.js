// Direct API Test - Bypass Next.js routing issues
// Run with: node direct_api_test.js

const { createClient } = require('@supabase/supabase-js')

// Test credentials (you'll need to provide these)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ksmxqswuzrmdgckwxkvn.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDirectAPI() {
  console.log('🧪 DIRECT API TEST - Admin Schema Integration')
  console.log('==========================================\n')

  try {
    // Test 1: Check if we can access admin tables through views
    console.log('1️⃣ Testing admin table access through views...')
    const { data: sessions, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*')
      .limit(1)

    if (sessionError) {
      console.log('   ❌ Session access failed:', sessionError.message)
    } else {
      console.log('   ✅ Session access successful')
      console.log('   📊 Sessions found:', sessions?.length || 0)
    }

    // Test 2: Check if we can access admin conversations through views
    console.log('\n2️⃣ Testing admin conversation access through views...')
    const { data: conversations, error: convError } = await supabase
      .from('admin_conversations')
      .select('*')
      .limit(1)

    if (convError) {
      console.log('   ❌ Conversation access failed:', convError.message)
    } else {
      console.log('   ✅ Conversation access successful')
      console.log('   📊 Conversations found:', conversations?.length || 0)
    }

    // Test 3: Try to insert a test record (this should work if schema is correct)
    console.log('\n3️⃣ Testing admin session creation...')
    const testSessionId = `direct-test-${Date.now()}`
    
    const { data: newSession, error: insertError } = await supabase
      .from('admin_sessions')
      .insert({
        id: testSessionId,
        admin_id: 'direct-test-user',
        session_name: 'Direct API Test Session',
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.log('   ❌ Session creation failed:', insertError.message)
      console.log('   🔍 This indicates either:')
      console.log('      - Schema mismatch (tables not in expected location)')
      console.log('      - RLS policy blocking access')
      console.log('      - Authentication issues')
    } else {
      console.log('   ✅ Session creation successful!')
      console.log('   📝 Created session:', newSession.id)
      
      // Cleanup
      await supabase.from('admin_sessions').delete().eq('id', testSessionId)
      console.log('   🧹 Test session cleaned up')
    }

    console.log('\n🎯 SUMMARY:')
    console.log('==========================================')
    
    if (sessionError && convError) {
      console.log('❌ Schema integration appears incomplete')
      console.log('   - Views may not exist or RLS policies blocking access')
    } else {
      console.log('✅ Schema integration appears to be working')
      if (!insertError) {
        console.log('✅ Full CRUD operations working')
      } else {
        console.log('⚠️ Read access works, but write operations blocked')
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Check if environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log('⚠️  Environment variables not set!')
  console.log('   Please set SUPABASE_URL and SUPABASE_ANON_KEY')
  console.log('   Example:')
  console.log('   export SUPABASE_URL="https://ksmxqswuzrmdgckwxkvn.supabase.co"')
  console.log('   export SUPABASE_ANON_KEY="your-anon-key"')
  process.exit(1)
}

testDirectAPI()
