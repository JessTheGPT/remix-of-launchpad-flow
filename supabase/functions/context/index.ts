import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const token = pathParts[pathParts.length - 1]

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('share_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check expiration
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Update access count
    await supabase
      .from('share_tokens')
      .update({
        access_count: (tokenData.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)

    // Fetch resources based on type
    const response: Record<string, unknown> = {
      generated_at: new Date().toISOString(),
      token_type: tokenData.resource_type,
    }

    const resourceType = tokenData.resource_type

    if (resourceType === 'all' || resourceType === 'team') {
      const { data: teams } = await supabase
        .from('teams')
        .select('*, agents(*)')
        .order('created_at', { ascending: false })
      response.teams = teams || []
    }

    if (resourceType === 'all' || resourceType === 'doc') {
      const { data: docs } = await supabase
        .from('context_docs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      response.context_docs = docs || []
    }

    if (resourceType === 'all' || resourceType === 'prompt') {
      const { data: prompts } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      response.prompt_templates = prompts || []
    }

    if (resourceType === 'all' || resourceType === 'tool') {
      const { data: tools } = await supabase
        .from('tools')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      response.tools = tools || []
    }

    return new Response(
      JSON.stringify(response, null, 2),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
