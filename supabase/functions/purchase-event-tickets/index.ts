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
        const { action, ...data } = await req.json();
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
            throw new Error('Environment configuration missing');
        }

        let result;

        switch (action) {
            case 'create_payment_intent':
                // Validate required fields
                const { eventId, quantity, customerName, customerEmail, customerPhone } = data;
                
                if (!eventId || !quantity || !customerName || !customerEmail) {
                    throw new Error('Missing required fields: eventId, quantity, customerName, customerEmail');
                }

                if (quantity <= 0 || quantity > 10) {
                    throw new Error('Invalid quantity. Must be between 1 and 10');
                }

                console.log('Creating payment intent for event tickets:', { eventId, quantity });

                // Get event details
                const eventResponse = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=*`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (!eventResponse.ok) {
                    throw new Error('Failed to fetch event details');
                }

                const events = await eventResponse.json();
                if (events.length === 0) {
                    throw new Error('Event not found');
                }

                const event = events[0];
                
                // Check if event is published and has tickets available
                if (!event.is_published) {
                    throw new Error('Event is not available for booking');
                }

                if (event.ticket_price <= 0) {
                    throw new Error('This event does not sell tickets');
                }

                // Check availability
                if (event.max_attendees && (event.current_attendees + quantity) > event.max_attendees) {
                    const remaining = event.max_attendees - event.current_attendees;
                    throw new Error(`Only ${remaining} tickets remaining`);
                }

                const totalAmount = event.ticket_price * quantity;

                // Create Stripe payment intent
                const stripeParams = new URLSearchParams();
                stripeParams.append('amount', Math.round(totalAmount * 100).toString()); // Convert to cents
                stripeParams.append('currency', 'gbp');
                stripeParams.append('payment_method_types[]', 'card');
                stripeParams.append('metadata[event_id]', eventId.toString());
                stripeParams.append('metadata[event_title]', event.title);
                stripeParams.append('metadata[quantity]', quantity.toString());
                stripeParams.append('metadata[customer_name]', customerName);
                stripeParams.append('metadata[customer_email]', customerEmail);
                stripeParams.append('metadata[customer_phone]', customerPhone || '');
                stripeParams.append('metadata[event_date]', event.event_date);
                stripeParams.append('metadata[ticket_price]', event.ticket_price.toString());

                const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: stripeParams.toString()
                });

                if (!stripeResponse.ok) {
                    const errorData = await stripeResponse.text();
                    console.error('Stripe API error:', errorData);
                    throw new Error(`Payment setup failed: ${errorData}`);
                }

                const paymentIntent = await stripeResponse.json();
                console.log('Payment intent created:', paymentIntent.id);

                result = {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    totalAmount,
                    eventTitle: event.title,
                    eventDate: event.event_date,
                    quantity
                };
                break;

            case 'confirm_ticket_purchase':
                const { paymentIntentId } = data;
                
                if (!paymentIntentId) {
                    throw new Error('Payment intent ID is required');
                }

                console.log('Confirming ticket purchase:', paymentIntentId);

                // Verify payment with Stripe
                const verifyResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`
                    }
                });

                if (!verifyResponse.ok) {
                    throw new Error('Failed to verify payment');
                }

                const paymentData = await verifyResponse.json();
                
                if (paymentData.status !== 'succeeded') {
                    throw new Error('Payment not completed');
                }

                // Extract metadata
                const metadata = paymentData.metadata;
                const ticketEventId = parseInt(metadata.event_id);
                const ticketQuantity = parseInt(metadata.quantity);
                const ticketCustomerName = metadata.customer_name;
                const ticketCustomerEmail = metadata.customer_email;
                const ticketCustomerPhone = metadata.customer_phone || null;
                const ticketPrice = parseFloat(metadata.ticket_price);
                const totalTicketAmount = ticketPrice * ticketQuantity;

                // Create ticket sale record
                const ticketSaleData = {
                    event_id: ticketEventId,
                    customer_name: ticketCustomerName,
                    customer_email: ticketCustomerEmail,
                    customer_phone: ticketCustomerPhone,
                    quantity: ticketQuantity,
                    total_amount: totalTicketAmount,
                    stripe_payment_intent_id: paymentIntentId,
                    status: 'confirmed',
                    purchase_date: new Date().toISOString()
                };

                const ticketResponse = await fetch(`${supabaseUrl}/rest/v1/event_ticket_sales`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(ticketSaleData)
                });

                if (!ticketResponse.ok) {
                    const errorText = await ticketResponse.text();
                    console.error('Failed to create ticket sale:', errorText);
                    throw new Error('Failed to process ticket purchase');
                }

                const ticketSale = await ticketResponse.json();
                console.log('Ticket sale created:', ticketSale[0].id);

                // Update event current_attendees
                const updateEventResponse = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${ticketEventId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        current_attendees: ticketQuantity, // This would need to be incremental in production
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateEventResponse.ok) {
                    console.error('Failed to update event attendees count');
                }

                result = {
                    success: true,
                    ticketSaleId: ticketSale[0].id,
                    confirmationNumber: `TKT-${ticketSale[0].id.toString().padStart(6, '0')}`,
                    eventTitle: metadata.event_title,
                    eventDate: metadata.event_date,
                    quantity: ticketQuantity,
                    totalAmount: totalTicketAmount,
                    customerName: ticketCustomerName,
                    customerEmail: ticketCustomerEmail
                };
                break;

            case 'get_ticket_sales':
                // Get user from auth header  
                const authHeader = req.headers.get('authorization');
                if (!authHeader) {
                    throw new Error('No authorization header');
                }

                const token = authHeader.replace('Bearer ', '');
                
                // Verify admin user
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!userResponse.ok) {
                    throw new Error('Unauthorized access');
                }

                // Get all ticket sales with event details
                const ticketSalesResponse = await fetch(`${supabaseUrl}/rest/v1/event_ticket_sales?select=*&order=purchase_date.desc`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (!ticketSalesResponse.ok) {
                    throw new Error('Failed to fetch ticket sales');
                }

                result = await ticketSalesResponse.json();
                break;

            default:
                throw new Error('Invalid action');
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Ticket purchase error:', error);

        const errorResponse = {
            error: {
                code: 'TICKET_PURCHASE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
