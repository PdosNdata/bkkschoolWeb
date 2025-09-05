import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user IDs from request
    const { userIds } = await req.json()
    
    console.log('Fetching emails for user IDs:', userIds)

    // Fetch users from auth system using admin privileges
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    // Create a map of user_id to email
    const userEmailMap: { [key: string]: string } = {}
    if (users) {
      users.forEach(user => {
        if (userIds.includes(user.id)) {
          userEmailMap[user.id] = user.email || 'ไม่ระบุอีเมล'
        }
      })
    }

    console.log('User email map:', userEmailMap)

    return new Response(
      JSON.stringify({ userEmailMap }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-user-emails function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})