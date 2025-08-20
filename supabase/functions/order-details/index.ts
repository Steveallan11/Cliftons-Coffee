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
    const orderId = url.searchParams.get('id')

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get order details with items
    const [orderResult, itemsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single(),
      
      supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('id')
    ])

    if (orderResult.error) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const order = orderResult.data
    const items = itemsResult.data || []

    // Calculate summary
    const itemsTotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
    const summary = {
      subtotal: itemsTotal,
      total: parseFloat(order.total_amount),
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order,
          items,
          summary
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Order details error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})