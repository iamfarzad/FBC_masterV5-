// Test Admin Schema Migration
// Run with: node test_admin_schema.js

const { createClient } = require('@supabase/supabase-js')

// Use your service role key for testing
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminSchema() {
  console.log('🧪 Testing Admin Schema Migration...\n')

  try {
    // Test 1: Check schema locations
    console.log('1️⃣ Checking table schemas...')
    const { data: tables, error: schemaError } = await supabase
      .rpc('sql', {
        query: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename IN ('admin_conversations', 'admin_sessions')
          ORDER BY schemaname
        `
      })

    if (schemaError) {
      console.log('   ❌ Schema check failed:', schemaError.message)
    } else {
      console.log('   ✅ Schema check passed')
      tables?.forEach(table => {
        console.log(`      - ${table.schemaname}.${table.tablename} (RLS: ${table.rowsecurity})`)
      })
    }

    // Test 2: Test admin session creation
    console.log('\n2️⃣ Testing admin session creation...')
    const testSessionId = `test-session-${Date.now()}`
    
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        id: testSessionId,
        admin_id: 'test-admin',
        session_name: 'Test Session',
        is_active: true
      })
      .select()
      .single()

    if (sessionError) {
      console.log('   ❌ Session creation failed:', sessionError.message)
    } else {
      console.log('   ✅ Session creation passed')
      console.log(`      Created session: ${session.id}`)
    }

    // Test 3: Test admin conversation creation
    console.log('\n3️⃣ Testing admin conversation creation...')
    const { data: conversation, error: convError } = await supabase
      .from('admin_conversations')
      .insert({
        session_id: testSessionId,
        admin_id: 'test-admin',
        message_type: 'user',
        message_content: 'Test admin message',
        context_leads: ['test-conversation-1']
      })
      .select()
      .single()

    if (convError) {
      console.log('   ❌ Conversation creation failed:', convError.message)
    } else {
      console.log('   ✅ Conversation creation passed')
      console.log(`      Created conversation: ${conversation.id}`)
    }

    // Test 4: Test search function
    console.log('\n4️⃣ Testing search function...')
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_admin_conversations', {
        query_embedding: Array(1536).fill(0.1), // Dummy embedding
        session_id_filter: testSessionId,
        limit_count: 5,
        similarity_threshold: 0.5
      })

    if (searchError) {
      console.log('   ❌ Search function failed:', searchError.message)
    } else {
      console.log('   ✅ Search function passed')
      console.log(`      Found ${searchResults?.length || 0} results`)
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.from('admin_conversations').delete().eq('session_id', testSessionId)
    await supabase.from('admin_sessions').delete().eq('id', testSessionId)
    console.log('   ✅ Cleanup completed')

    console.log('\n🎉 Admin Schema Migration Test Complete!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

testAdminSchema()
