import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const messageId = url.searchParams.get('id')

    if (req.method === 'GET') {
      // Get all messages or specific message
      if (messageId) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('id', messageId)
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Message not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Get all messages with pagination
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const status = url.searchParams.get('status')
        const offset = (page - 1) * limit

        let query = supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (status && status !== 'all') {
          query = query.eq('status', status)
        }

        const { data, error, count } = await query

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch messages' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ data, total: count, page, limit }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (req.method === 'PATCH') {
      // Update message status or reply
      const { status, reply_message, admin_email } = await req.json()

      if (!messageId) {
        return new Response(
          JSON.stringify({ error: 'Message ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: any = { updated_at: new Date().toISOString() }
      
      if (status) {
        updateData.status = status
      }
      
      if (reply_message) {
        updateData.reply_message = reply_message
        updateData.replied_at = new Date().toISOString()
        updateData.status = 'replied'
      }

      const { data, error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to update message' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log admin activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_email: admin_email || 'admin',
          action_type: reply_message ? 'message_replied' : 'message_updated',
          action_description: reply_message ? `Replied to message from ${data.email}` : `Updated message status to ${status}`,
          target_type: 'message',
          target_id: parseInt(messageId)
        })

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin messages error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})