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
    const type = url.searchParams.get('type') || 'overview'
    const period = url.searchParams.get('period') || '7d'

    let startDate: string
    const now = new Date()

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    if (type === 'overview') {
      // Get overview analytics
      const [ordersResult, bookingsResult, messagesResult, revenueResult] = await Promise.all([
        // Orders analytics
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .gte('created_at', startDate),
        
        // Bookings analytics
        supabase
          .from('table_bookings')
          .select('id, status, created_at')
          .gte('created_at', startDate),
        
        // Messages analytics
        supabase
          .from('messages')
          .select('id, status, created_at')
          .gte('created_at', startDate),
        
        // Revenue by day
        supabase
          .from('orders')
          .select('total_amount, created_at')
          .gte('created_at', startDate)
          .eq('status', 'completed')
      ])

      const orders = ordersResult.data || []
      const bookings = bookingsResult.data || []
      const messages = messagesResult.data || []
      const completedOrders = revenueResult.data || []

      // Calculate metrics
      const totalOrders = orders.length
      const totalBookings = bookings.length
      const totalMessages = messages.length
      const unreadMessages = messages.filter(m => m.status === 'new').length
      const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Order status breakdown
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {})

      // Booking status breakdown
      const bookingsByStatus = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1
        return acc
      }, {})

      // Daily revenue chart data
      const dailyRevenue = completedOrders.reduce((acc, order) => {
        const date = order.created_at.split('T')[0]
        acc[date] = (acc[date] || 0) + parseFloat(order.total_amount)
        return acc
      }, {})

      const chartData = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            totalOrders,
            totalBookings,
            totalMessages,
            unreadMessages,
            totalRevenue,
            avgOrderValue,
            ordersByStatus,
            bookingsByStatus,
            dailyRevenue: chartData,
            period
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (type === 'popular-items') {
      // Get popular items analytics
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('item_name, quantity, subtotal')
        .gte('created_at', startDate)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch order items' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Aggregate by item
      const itemStats = (orderItems || []).reduce((acc, item) => {
        const name = item.item_name
        if (!acc[name]) {
          acc[name] = { name, totalQuantity: 0, totalRevenue: 0, orderCount: 0 }
        }
        acc[name].totalQuantity += item.quantity
        acc[name].totalRevenue += parseFloat(item.subtotal)
        acc[name].orderCount += 1
        return acc
      }, {})

      const popularItems = Object.values(itemStats)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10)

      return new Response(
        JSON.stringify({ success: true, data: popularItems }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid analytics type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})