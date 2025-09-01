import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Execute SQL Edge Function started')

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Get the service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse the request body
    const { sql } = await req.json()

    if (!sql) {
      return new Response(JSON.stringify({ error: 'No SQL provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('Executing SQL:', sql)

    // Execute the SQL using the underlying PostgreSQL connection
    // This requires using the raw SQL execution capability
    const { data, error } = await supabase.rpc('exec', { sql })

    if (error) {
      console.error('SQL execution error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('SQL executed successfully:', data)

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: 'SQL executed successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
