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
            amount, 
            currency = 'gbp', 
            cartItems, 
            customerEmail,
            customerName,
            customerPhone,
            orderType,
            deliveryAddress,
            specialInstructions 
        } = await req.json();

        console.log('Payment intent request received:', { amount, currency, customerEmail });

        // Validate required parameters
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Cart items are required');
        }

        if (!customerEmail || !customerName) {
            throw new Error('Customer email and name are required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!stripeSecretKey) {
            console.error('Stripe secret key not found in environment');
            throw new Error('Payment processing not configured');
        }

        console.log('Environment variables validated, creating payment intent...');

        // Calculate total amount from cart items to verify
        const deliveryFee = orderType === 'delivery' ? 2.50 : 0;
        const calculatedAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryFee;
        
        if (Math.abs(calculatedAmount - amount) > 0.01) {
            throw new Error('Amount mismatch: calculated amount does not match provided amount');
        }

        // Prepare Stripe payment intent data
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString()); // Convert to cents
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[customer_email]', customerEmail);
        stripeParams.append('metadata[customer_name]', customerName);
        stripeParams.append('metadata[customer_phone]', customerPhone || '');
        stripeParams.append('metadata[order_type]', orderType);
        stripeParams.append('metadata[cart_items_count]', cartItems.length.toString());
        stripeParams.append('metadata[total_items]', cartItems.reduce((sum, item) => sum + item.quantity, 0).toString());
        stripeParams.append('metadata[delivery_address]', deliveryAddress || '');
        stripeParams.append('metadata[special_instructions]', specialInstructions || '');

        // Create payment intent with Stripe
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        console.log('Stripe API response status:', stripeResponse.status);

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error('Stripe API error:', errorData);
            throw new Error(`Payment processing failed: ${errorData}`);
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent created successfully:', paymentIntent.id);

        const result = {
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amount,
                currency: currency
            }
        };

        console.log('Payment intent creation completed successfully');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment intent creation error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_INTENT_FAILED',
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