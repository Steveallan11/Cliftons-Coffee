Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase configuration');
        }

        if (req.method === 'POST') {
            const orderData = await req.json();
            
            // Create order record
            const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    customer_email: orderData.customer_email,
                    customer_name: orderData.customer_name,
                    customer_phone: orderData.customer_phone,
                    order_type: orderData.order_type,
                    total_amount: orderData.total_amount,
                    status: 'pending',
                    stripe_payment_intent_id: orderData.stripe_payment_intent_id,
                    special_instructions: orderData.special_instructions,
                    delivery_address: orderData.delivery_address
                })
            });

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                throw new Error(`Failed to create order: ${errorText}`);
            }

            const order = await orderResponse.json();
            const orderId = order[0]?.id;

            // Create order items
            if (orderData.items && orderData.items.length > 0) {
                const orderItems = orderData.items.map((item: any) => ({
                    order_id: orderId,
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity,
                    price_at_time: item.price_at_time,
                    special_requests: item.special_requests
                }));

                const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_ROLE_KEY,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(orderItems)
                });

                if (!itemsResponse.ok) {
                    const errorText = await itemsResponse.text();
                    console.error('Failed to create order items:', errorText);
                }
            }

            return new Response(JSON.stringify({
                success: true,
                data: order[0]
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // GET method - retrieve orders
        const ordersResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=50`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY
            }
        });

        if (!ordersResponse.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await ordersResponse.json();

        return new Response(JSON.stringify({
            success: true,
            data: orders
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Orders function error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'ORDERS_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});