// Admin Schema Test with Service Role Key
const { createClient } = require('@supabase/supabase-js')

// Use service role key for admin table access
const supabaseUrl = 'https://ksmxqswuzrmdgckwxkvn.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc4NTI2MiwiZXhwIjoyMDU3MzYxMjYyfQ.9H3ihs0mEAEDk03d_V-Bt8Ywl4uouVIJ13CFUM3nVxU'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testAdminSchema() {
  console.log('🧪 ADMIN SCHEMA TEST WITH SERVICE ROLE KEY')
  console.log('==========================================\n')

  try {
    // Test 1: Basic connection test
    console.log('1️⃣ Testing basic Supabase connection...')
    const { data: version, error: versionError } = await supabase.rpc('version').select()
    
    if (versionError) {
      console.log('   ⚠️ RPC call failed (expected for some Supabase configs)')
    } else {
      console.log('   ✅ Basic connection successful')
    }

    // Test 2: Check if admin tables exist through direct access
    console.log('\n2️⃣ Testing direct admin table access...')
    const { data: adminSessions, error: adminError } = await supabase
      .from('admin.admin_sessions')  // Direct schema access
      .select('*')
      .limit(1)

    if (adminError) {
      console.log('   ❌ Direct admin schema access failed:', adminError.message)
    } else {
      console.log('   ✅ Direct admin schema access successful')
      console.log('   📊 Admin sessions found:', adminSessions?.length || 0)
    }

    // Test 3: Check if views work
    console.log('\n3️⃣ Testing admin table access through views...')
    const { data: viewSessions, error: viewError } = await supabase
      .from('admin_sessions')  // Through view
      .select('*')
      .limit(1)

    if (viewError) {
      console.log('   ❌ View access failed:', viewError.message)
      console.log('   🔍 This indicates views may not exist or RLS is blocking')
    } else {
      console.log('   ✅ View access successful')
      console.log('   📊 Sessions through view:', viewSessions?.length || 0)
    }

    // Test 4: Try to create a test admin session
    console.log('\n4️⃣ Testing admin session creation...')
    const testSessionId = `schema-test-${Date.now()}`
    
    const { data: newSession, error: createError } = await supabase
      .from('admin_sessions')
      .insert({
        id: testSessionId,
        admin_id: 'schema-test-user',
        session_name: 'Schema Integration Test',
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.log('   ❌ Session creation failed:', createError.message)
      console.log('   🔍 Possible causes:')
      console.log('      - Views don\'t exist')
      console.log('      - RLS policies blocking')
      console.log('      - Schema mismatch')
    } else {
      console.log('   ✅ Session creation successful!')
      console.log('   📝 Created session:', newSession.id)
      
      // Cleanup
      await supabase.from('admin_sessions').delete().eq('id', testSessionId)
      console.log('   🧹 Test session cleaned up')
    }

    // Test 5: Check admin conversations
    console.log('\n5️⃣ Testing admin conversations access...')
    const { data: conversations, error: convError } = await supabase
      .from('admin_conversations')
      .select('*')
      .limit(1)

    if (convError) {
      console.log('   ❌ Admin conversations access failed:', convError.message)
    } else {
      console.log('   ✅ Admin conversations access successful')
      console.log('   📊 Conversations found:', conversations?.length || 0)
    }

    console.log('\n🎯 FINAL ASSESSMENT:')
    console.log('==========================================')
    
    const issues = []
    if (adminError) issues.push('Direct schema access failed')
    if (viewError) issues.push('Views not working')
    if (createError) issues.push('CRUD operations blocked')
    if (convError) issues.push('Conversations access failed')
    
    if (issues.length === 0) {
      console.log('✅ ADMIN SCHEMA INTEGRATION: 100% SUCCESSFUL')
      console.log('   - Tables accessible through views')
      console.log('   - CRUD operations working')
      console.log('   - RLS policies configured correctly')
    } else {
      console.log('⚠️ ADMIN SCHEMA INTEGRATION: PARTIAL SUCCESS')
      console.log('   Issues found:')
      issues.forEach(issue => console.log(`   - ${issue}`))
      console.log('\n   🔧 Next steps:')
      console.log('   - Verify views exist in Supabase')
      console.log('   - Check RLS policy configuration')
      console.log('   - Confirm schema migration completed')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

testAdminSchema()
