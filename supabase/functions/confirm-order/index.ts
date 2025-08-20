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
        const { 
            paymentIntentId,
            cartItems, 
            customerEmail,
            customerName,
            customerPhone,
            orderType,
            deliveryAddress,
            specialInstructions,
            totalAmount
        } = await req.json();

        console.log('Confirm order request received:', { paymentIntentId, customerEmail });

        // Validate required parameters
        if (!paymentIntentId) {
            throw new Error('Payment intent ID is required');
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Cart items are required');
        }

        if (!customerEmail || !customerName) {
            throw new Error('Customer details are required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Configuration missing');
        }

        // Verify payment with Stripe
        const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`
            }
        });

        if (!stripeResponse.ok) {
            throw new Error('Failed to verify payment with Stripe');
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent status:', paymentIntent.status);

        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment has not been completed successfully');
        }

        // Create order record in database
        const orderData = {
            customer_email: customerEmail,
            customer_name: customerName,
            customer_phone: customerPhone || null,
            order_type: orderType,
            total_amount: totalAmount,
            status: 'confirmed',
            stripe_payment_intent_id: paymentIntentId,
            special_instructions: specialInstructions || null,
            delivery_address: deliveryAddress || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Creating order in database...');

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error('Failed to create order:', errorText);
            throw new Error(`Failed to create order: ${errorText}`);
        }

        const order = await orderResponse.json();
        const orderId = order[0].id;
        console.log('Order created successfully:', orderId);

        // Create order items
        const orderItems = cartItems.map(item => ({
            order_id: orderId,
            menu_item_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price,
            special_requests: item.special_requests || null,
            created_at: new Date().toISOString()
        }));

        console.log('Creating order items...');

        const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderItems)
        });

        if (!orderItemsResponse.ok) {
            const errorText = await orderItemsResponse.text();
            console.error('Failed to create order items:', errorText);
            // Don't fail the entire operation, but log the error
            console.warn('Order created but order items creation failed');
        } else {
            console.log('Order items created successfully');
        }

        const result = {
            success: true,
            data: {
                orderId: orderId,
                status: 'confirmed',
                paymentIntentId: paymentIntentId,
                totalAmount: totalAmount
            }
        };

        console.log('Order confirmation completed successfully');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Order confirmation error:', error);

        const errorResponse = {
            error: {
                code: 'ORDER_CONFIRMATION_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});