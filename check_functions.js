const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ksmxqswuzrmdgckwxkvn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc4NTI2MiwiZXhwIjoyMDU3MzYxMjYyfQ.9H3ihs0mEAEDk03d_V-Bt8Ywl4uouVIJ13CFUM3nVxU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkFunctions() {
  try {
    console.log('Checking available functions...');
    
    // Try to query the pg_proc table to see what functions exist
    const { data, error } = await supabase.rpc('sql', {
      query: "SELECT proname, pronamespace::regnamespace as schema_name FROM pg_proc WHERE proname LIKE '%update%';"
    });
    
    if (error) {
      console.log('RPC failed, trying direct query...');
      
      // Try a simple query to see if we can connect
      const { data: testData, error: testError } = await supabase
        .from('_supabase_functions')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.log('Direct query failed:', testError.message);
      } else {
        console.log('Connection successful, found functions table');
      }
    } else {
      console.log('Found functions:', data);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkFunctions();
