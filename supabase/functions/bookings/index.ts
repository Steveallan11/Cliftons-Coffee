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
            const bookingData = await req.json();
            
            const bookingResponse = await fetch(`${SUPABASE_URL}/rest/v1/table_bookings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    customer_name: bookingData.customer_name,
                    customer_email: bookingData.customer_email,
                    customer_phone: bookingData.customer_phone,
                    party_size: bookingData.party_size,
                    booking_date: bookingData.booking_date,
                    booking_time: bookingData.booking_time,
                    status: 'pending',
                    special_requests: bookingData.special_requests
                })
            });

            if (!bookingResponse.ok) {
                const errorText = await bookingResponse.text();
                throw new Error(`Failed to create booking: ${errorText}`);
            }

            const booking = await bookingResponse.json();

            return new Response(JSON.stringify({
                success: true,
                data: booking[0]
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // GET method - retrieve bookings
        const bookingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/table_bookings?select=*&order=booking_date.asc&limit=50`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY
            }
        });

        if (!bookingsResponse.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await bookingsResponse.json();

        return new Response(JSON.stringify({
            success: true,
            data: bookings
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Bookings function error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'BOOKINGS_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});