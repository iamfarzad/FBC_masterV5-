// Simple Supabase Connection Test
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ksmxqswuzrmdgckwxkvn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxczd1enJtZGdja3d4a3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODUyNjIsImV4cCI6MjA1NzM2MTI2Mn0.YKz7fKPbl7pbvEMN08lFOPm1SSg59R4lu8tzV8Kkz2E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBasicConnection() {
  console.log('🧪 BASIC SUPABASE CONNECTION TEST')
  console.log('=================================\n')
  
  try {
    // Test basic connection by trying to get server version
    const { data, error } = await supabase.rpc('version')
    
    if (error) {
      console.log('❌ Basic RPC call failed:', error.message)
      
      // Try a different approach - check if we can access any table
      console.log('\n🔄 Trying table access...')
      const { data: testData, error: tableError } = await supabase
        .from('conversations')
        .select('count', { count: 'exact', head: true })
      
      if (tableError) {
        console.log('❌ Table access failed:', tableError.message)
        console.log('🔍 Possible issues:')
        console.log('   - Invalid API key')
        console.log('   - Network connectivity')
        console.log('   - Supabase project issues')
      } else {
        console.log('✅ Basic table access works')
        console.log('📊 Conversation count:', testData)
      }
    } else {
      console.log('✅ Basic RPC call successful')
      console.log('�� Server version:', data)
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

testBasicConnection()
