const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc4NTI2MiwiZXhwIjoyMDU3MzYxMjYyfQ.9H3ihs0mEAEDk03d_V-Bt8Ywl4uouVIJ13CFUM3nVxU";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function checkAndExecute() {
  try {
    console.log('🔍 Checking function existence...');
    
    // Check if function exists
    const { data: functions, error: funcError } = await supabase.rpc('sql', {
      query: "SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column'"
    });
    
    if (funcError) {
      console.log('❌ Function check failed, trying direct SQL execution...');
      
      // Try direct execution with service role
      const { data, error } = await supabase.rpc('exec', {
        sql: `
          ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;
          ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;
        `
      });
      
      if (error) {
        console.error('❌ Execution error:', error.message);
        console.log('💡 This might be due to:');
        console.log('   1. Insufficient permissions');
        console.log('   2. Function does not exist'); 
        console.log('   3. Supabase security restrictions');
      } else {
        console.log('✅ Success:', data);
      }
    } else {
      console.log('✅ Function exists:', functions);
      console.log('🔧 Attempting to modify function...');
      
      // Function exists, try to modify it
      const { data, error } = await supabase.rpc('exec', {
        sql: `
          ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;
          ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;
        `
      });
      
      if (error) {
        console.error('❌ Modification error:', error.message);
      } else {
        console.log('✅ Function modified successfully:', data);
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

checkAndExecute();
